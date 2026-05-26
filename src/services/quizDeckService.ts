import { getCareerTrack } from '../config/careers';
import { SKILL_TAXONOMY, ALL_SKILLS } from '../config/skillTaxonomy';
import { buildSkillQuestion, type QuizDifficulty, type QuizQuestionMeta } from '../content/quizBank';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { UserProfile } from '../types';
import { EngagementService } from './engagementService';
import { MissionService } from './missionService';
import { QuizService } from './quizService';
import { RoadmapEngine } from './roadmapEngine';
import { XPService } from './xpService';

export interface QuizAttemptSummary {
  score: number;
  passed: boolean;
  xpEarned: number;
  awarded: boolean;
  completedAt: string;
}

export interface QuizDeck {
  id: string;
  mode: 'daily' | 'weekly';
  title: string;
  questions: QuizQuestionMeta[];
  passThreshold: number;
  xpReward: number;
  attempt?: QuizAttemptSummary;
  careerGoal?: string;
  focusSkill?: string;
}

export interface QuizHistoryRow {
  id: string;
  deckId: string;
  mode: 'daily' | 'weekly';
  score: number;
  passed: boolean;
  xpEarned: number;
  createdAt: string;
  focusSkill?: string;
}

const DAILY_TARGET: Record<QuizDifficulty, number> = { Hard: 5, Medium: 3, Easy: 2 };
const WEEKLY_TARGET: Record<QuizDifficulty, number> = { Hard: 25, Medium: 15, Easy: 10 };

const DIFFICULTY_XP: Record<QuizDifficulty, number> = { Easy: 5, Medium: 8, Hard: 12 };

const TRACK_CATEGORIES: Record<ReturnType<typeof getCareerTrack>, string[]> = {
  ai: ['AI, ML & Data', 'Programming Languages', 'Data Engineering', 'Tools & Practices'],
  data: ['Data Engineering', 'AI, ML & Data', 'Programming Languages', 'Tools & Practices'],
  web: ['Web & Frontend', 'Backend & APIs', 'Programming Languages', 'Tools & Practices'],
  backend: ['Backend & APIs', 'Programming Languages', 'Cloud & DevOps', 'Tools & Practices'],
  devops: ['Cloud & DevOps', 'Backend & APIs', 'Tools & Practices'],
  security: ['Security', 'Backend & APIs', 'Tools & Practices'],
  mobile: ['Mobile & Desktop', 'Programming Languages', 'Tools & Practices'],
  embedded: ['Systems & Low-Level', 'Programming Languages', 'Tools & Practices'],
  game: ['Game & Graphics', 'Programming Languages', 'Tools & Practices'],
  blockchain: ['Blockchain & Web3', 'Backend & APIs', 'Programming Languages', 'Tools & Practices'],
  product: ['Tools & Practices', 'Web & Frontend', 'Backend & APIs'],
};

function todayKey(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededPick<T>(arr: T[], seed: number, count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  let s = seed || 1;
  while (out.length < count && copy.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out.push(copy.splice(s % copy.length, 1)[0]);
  }
  return out;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function weekKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function getTrackSkills(track: ReturnType<typeof getCareerTrack>): string[] {
  const categories = TRACK_CATEGORIES[track] || [];
  const picked = SKILL_TAXONOMY.filter((c) => categories.includes(c.category));
  return picked.flatMap((c) => c.skills);
}

function buildQuestionPool(skills: string[], difficulty: QuizDifficulty, seed: number, career?: string): QuizQuestionMeta[] {
  const templates = 3;
  const pool: QuizQuestionMeta[] = [];
  skills.forEach((skill, idx) => {
    for (let i = 0; i < templates; i++) {
      pool.push(buildSkillQuestion(skill, difficulty, seed + idx + i, career));
    }
  });
  return pool;
}

function pickQuestions(
  skills: string[],
  difficulty: QuizDifficulty,
  count: number,
  seed: number,
  fallbackSkills: string[],
  career?: string
): QuizQuestionMeta[] {
  const pool = buildQuestionPool(skills, difficulty, seed, career);
  const picked = seededPick(pool, seed + 17, count);
  if (picked.length >= count) return picked;

  const needed = count - picked.length;
  const fallbackPool = buildQuestionPool(fallbackSkills, difficulty, seed + 71, career)
    .filter((q) => !picked.find((p) => p.id === q.id));
  return picked.concat(seededPick(fallbackPool, seed + 91, needed));
}

function calcXp(questions: QuizQuestionMeta[]): number {
  return questions.reduce((sum, q) => sum + DIFFICULTY_XP[q.difficulty], 0);
}

function readAttempt(userId: string, deckId: string): QuizAttemptSummary | undefined {
  try {
    const raw = localStorage.getItem(`quiz_attempt_${userId}_${deckId}`);
    return raw ? (JSON.parse(raw) as QuizAttemptSummary) : undefined;
  } catch {
    return undefined;
  }
}

function saveAttempt(userId: string, deckId: string, attempt: QuizAttemptSummary) {
  localStorage.setItem(`quiz_attempt_${userId}_${deckId}`, JSON.stringify(attempt));
}

async function getLatestAttempt(userId: string, deckId: string): Promise<QuizAttemptSummary | undefined> {
  const localAttempt = readAttempt(userId, deckId);
  if (!isSupabaseConfigured) return localAttempt;

  const { data } = await supabase
    .from('quiz_attempts')
    .select('score, passed, xp_earned, created_at')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return localAttempt;
  return {
    score: data.score || 0,
    passed: Boolean(data.passed),
    xpEarned: data.xp_earned || 0,
    awarded: (data.xp_earned || 0) > 0,
    completedAt: data.created_at,
  };
}

function profileSkillOrder(profile: UserProfile, focusSkill?: string): string[] {
  const learning = profile.skills.learning
    .filter((s) => ['Learning', 'Practicing', 'Assessing'].includes(s.status || 'Learning'))
    .map((s) => s.name);
  const known = profile.skills.known.map((s) => s.name);
  return Array.from(new Set([focusSkill, ...learning, ...known].filter(Boolean) as string[]));
}

function buildDeckFromSkills(params: {
  userId: string;
  profile: UserProfile;
  mode: 'daily' | 'weekly';
  deckId: string;
  seedText: string;
  title: string;
  activeSkills: string[];
  fallbackSkills: string[];
  targets: Record<QuizDifficulty, number>;
  focusSkill?: string;
}): QuizDeck {
  const seed = hashSeed(params.seedText);
  const hard = pickQuestions(params.activeSkills, 'Hard', params.targets.Hard, seed + 1, params.fallbackSkills, params.profile.goals.career);
  const medium = pickQuestions(params.activeSkills, 'Medium', params.targets.Medium, seed + 2, params.fallbackSkills, params.profile.goals.career);
  const easy = pickQuestions(params.activeSkills, 'Easy', params.targets.Easy, seed + 3, params.fallbackSkills, params.profile.goals.career);
  const questions = seededShuffle([...hard, ...medium, ...easy], seed + 99);

  return {
    id: params.deckId,
    mode: params.mode,
    title: params.title,
    questions,
    passThreshold: 70,
    xpReward: calcXp(questions),
    careerGoal: params.profile.goals.career,
    focusSkill: params.focusSkill,
    attempt: readAttempt(params.userId, params.deckId),
  };
}

async function saveDeck(userId: string, deck: QuizDeck): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('quiz_decks').upsert({
    user_id: userId,
    deck_key: deck.id,
    mode: deck.mode,
    quiz_date: deck.mode === 'daily' ? todayKey() : weekKey(),
    title: deck.title,
    career_goal: deck.careerGoal,
    focus_skill: deck.focusSkill,
    questions: deck.questions,
    pass_threshold: deck.passThreshold,
    xp_reward: deck.xpReward,
  });
  if (error) console.warn('quiz deck persistence failed', error);
}

async function getPersistedDeck(userId: string, deckId: string): Promise<QuizDeck | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('quiz_decks')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_key', deckId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.deck_key,
    mode: data.mode,
    title: data.title,
    questions: (data.questions || []) as QuizQuestionMeta[],
    passThreshold: data.pass_threshold || 70,
    xpReward: data.xp_reward || 0,
    careerGoal: data.career_goal,
    focusSkill: data.focus_skill,
    attempt: await getLatestAttempt(userId, data.deck_key),
  };
}

export const QuizDeckService = {
  async getDailyQuiz(userId: string, profile: UserProfile): Promise<QuizDeck> {
    const today = todayKey();
    const focus = await RoadmapEngine.getCurrentFocus(userId);
    const track = getCareerTrack(profile.goals.career);
    const fallbackSkills = getTrackSkills(track).length ? getTrackSkills(track) : ALL_SKILLS;
    const activeSkills = profileSkillOrder(profile, focus?.skillName).length
      ? profileSkillOrder(profile, focus?.skillName)
      : fallbackSkills;
    const deckId = `daily-${today}`;

    const persisted = await getPersistedDeck(userId, deckId);
    if (persisted) return persisted;

    const deck = buildDeckFromSkills({
      userId,
      profile,
      mode: 'daily',
      deckId,
      title: focus?.skillName ? `Daily ${focus.skillName} Quiz` : 'Daily Skill Quiz',
      seedText: `${userId}-${today}-${profile.goals.career}-${activeSkills.join('|')}`,
      activeSkills,
      fallbackSkills,
      targets: DAILY_TARGET,
      focusSkill: focus?.skillName,
    });
    await saveDeck(userId, deck);
    return { ...deck, attempt: await getLatestAttempt(userId, deck.id) };
  },

  async getWeeklyQuiz(userId: string, profile: UserProfile): Promise<QuizDeck> {
    const track = getCareerTrack(profile.goals.career);
    const week = weekKey();
    const deckId = `weekly-${track}-${week}`;
    const trackSkills = getTrackSkills(track).length ? getTrackSkills(track) : ALL_SKILLS;

    const persisted = await getPersistedDeck(userId, deckId);
    if (persisted) return persisted;

    const deck = buildDeckFromSkills({
      userId,
      profile,
      mode: 'weekly',
      deckId,
      title: `Weekly ${profile.goals.career} Quiz`,
      seedText: `${profile.goals.career}-${track}-${week}`,
      activeSkills: trackSkills,
      fallbackSkills: trackSkills,
      targets: WEEKLY_TARGET,
    });
    await saveDeck(userId, deck);
    return { ...deck, attempt: await getLatestAttempt(userId, deck.id) };
  },

  async submitAttempt(userId: string, deck: QuizDeck, answers: Record<string, number>) {
    const score = QuizService.scoreAnswers(deck.questions, answers);
    const passed = score >= deck.passThreshold;
    let xpEarned = 0;
    let awarded = false;

    if (passed) {
      const result = await XPService.awardOnce(userId, 'quiz', deck.id, deck.xpReward);
      awarded = result.awarded;
      xpEarned = result.awarded ? deck.xpReward : 0;
    }

    const attempt: QuizAttemptSummary = {
      score,
      passed,
      xpEarned,
      awarded,
      completedAt: new Date().toISOString(),
    };
    saveAttempt(userId, deck.id, attempt);

    if (isSupabaseConfigured) {
      const fullPayload = {
        user_id: userId,
        deck_id: deck.id,
        quiz_date: deck.mode === 'daily' ? todayKey() : weekKey(),
        mode: deck.mode,
        score,
        passed,
        answers,
        questions: deck.questions,
        xp_earned: xpEarned,
        career_goal: deck.careerGoal,
        focus_skill: deck.focusSkill,
      };
      const { error } = await supabase.from('quiz_attempts').insert(fullPayload);
      if (error) {
        await supabase.from('quiz_attempts').insert({
          user_id: userId,
          score,
          answers,
          xp_earned: xpEarned,
        });
      }
    }

    await EngagementService.trackEvent(userId, 'quiz_completed', {
      deckId: deck.id,
      mode: deck.mode,
      score,
      passed,
      xpEarned,
      focusSkill: deck.focusSkill,
    });
    if (passed) await MissionService.completeByTarget(userId, 'quiz');

    return attempt;
  },

  async getAttemptHistory(userId: string): Promise<QuizHistoryRow[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id, deck_id, mode, score, passed, xp_earned, created_at, focus_skill')
      .eq('user_id', userId)
      .not('deck_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id,
      deckId: row.deck_id,
      mode: row.mode || 'daily',
      score: row.score || 0,
      passed: Boolean(row.passed),
      xpEarned: row.xp_earned || 0,
      createdAt: row.created_at,
      focusSkill: row.focus_skill,
    }));
  },
};
