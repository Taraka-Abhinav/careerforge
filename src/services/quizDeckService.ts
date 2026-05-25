import { getCareerTrack } from '../config/careers';
import { SKILL_TAXONOMY, ALL_SKILLS } from '../config/skillTaxonomy';
import { buildSkillQuestion, type QuizDifficulty, type QuizQuestionMeta } from '../content/quizBank';
import type { UserProfile } from '../types';
import { QuizService } from './quizService';
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
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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

export const QuizDeckService = {
  getDailyQuiz(userId: string, profile: UserProfile): QuizDeck {
    const today = new Date().toISOString().split('T')[0];
    const skills = Array.from(new Set([
      ...profile.skills.learning.map((s) => s.name),
      ...profile.skills.known.map((s) => s.name),
    ]));

    const track = getCareerTrack(profile.goals.career);
    const fallbackSkills = getTrackSkills(track).length ? getTrackSkills(track) : ALL_SKILLS;
    const activeSkills = skills.length ? skills : fallbackSkills;
    const seed = hashSeed(`${userId}-${today}-${activeSkills.join('|')}`);

    const hard = pickQuestions(activeSkills, 'Hard', DAILY_TARGET.Hard, seed + 1, fallbackSkills, profile.goals.career);
    const medium = pickQuestions(activeSkills, 'Medium', DAILY_TARGET.Medium, seed + 2, fallbackSkills, profile.goals.career);
    const easy = pickQuestions(activeSkills, 'Easy', DAILY_TARGET.Easy, seed + 3, fallbackSkills, profile.goals.career);

    const questions = seededShuffle([...hard, ...medium, ...easy], seed + 99);
    const deckId = `daily-${today}`;

    return {
      id: deckId,
      mode: 'daily',
      title: 'Daily Skill Quiz',
      questions,
      passThreshold: 70,
      xpReward: calcXp(questions),
      attempt: readAttempt(userId, deckId),
    };
  },

  getWeeklyQuiz(userId: string, profile: UserProfile): QuizDeck {
    const track = getCareerTrack(profile.goals.career);
    const week = weekKey();
    const deckId = `weekly-${track}-${week}`;
    const trackSkills = getTrackSkills(track).length ? getTrackSkills(track) : ALL_SKILLS;
    const seed = hashSeed(`${profile.goals.career}-${week}`);

    const hard = pickQuestions(trackSkills, 'Hard', WEEKLY_TARGET.Hard, seed + 11, trackSkills, profile.goals.career);
    const medium = pickQuestions(trackSkills, 'Medium', WEEKLY_TARGET.Medium, seed + 22, trackSkills, profile.goals.career);
    const easy = pickQuestions(trackSkills, 'Easy', WEEKLY_TARGET.Easy, seed + 33, trackSkills, profile.goals.career);

    const questions = seededShuffle([...hard, ...medium, ...easy], seed + 77);

    return {
      id: deckId,
      mode: 'weekly',
      title: `Weekly ${profile.goals.career} Quiz`,
      questions,
      passThreshold: 70,
      xpReward: calcXp(questions),
      attempt: readAttempt(userId, deckId),
    };
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

    return attempt;
  },
};
