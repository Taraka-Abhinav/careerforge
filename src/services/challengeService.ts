import { getCareerTrack } from '../config/careers';
import {
  ARENA_CHALLENGE_BANK,
  arenaChallengeId,
  getArenaChallengeById,
} from '../content/challengeBank';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { ChallengeRecord, UserProfile } from '../types';
import { ValidationService } from './validationService';
import { GoalService } from './goalService';
import { MissionService } from './missionService';
import { ProfileService } from './profileService';
import { XPService } from './xpService';

const CATEGORIES = ['Coding', 'Debugging', 'Logic', 'Database', 'AI', 'Web Development', 'Cybersecurity', 'System Design'];

const TRACK_CATEGORY_MAP: Record<ReturnType<typeof getCareerTrack>, string[]> = {
  ai: ['AI', 'Coding', 'Logic', 'Database', 'System Design'],
  data: ['Database', 'AI', 'Logic', 'Coding'],
  web: ['Web Development', 'Coding', 'Debugging', 'Database', 'System Design'],
  backend: ['Coding', 'Database', 'System Design', 'Debugging'],
  devops: ['System Design', 'Debugging', 'Coding', 'Cybersecurity'],
  security: ['Cybersecurity', 'Debugging', 'System Design', 'Logic'],
  mobile: ['Web Development', 'Coding', 'Debugging', 'Logic'],
  embedded: ['Coding', 'Logic', 'Debugging', 'System Design'],
  game: ['Coding', 'Logic', 'System Design', 'AI'],
  blockchain: ['Cybersecurity', 'System Design', 'Coding', 'Database'],
  product: ['Logic', 'System Design', 'Database', 'Web Development'],
};

function todayKey(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function normalizeCategory(category: string): string {
  if (category === 'Frontend' || category === 'Backend') return 'Web Development';
  return category;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

function bankToRecord(t: (typeof ARENA_CHALLENGE_BANK)[0], status = 'open', personalizedReason?: string): ChallengeRecord {
  return {
    id: arenaChallengeId(t.id),
    title: t.title,
    description: t.description,
    type: normalizeCategory(t.category),
    difficulty: t.difficulty,
    xpReward: t.xpReward,
    status,
    starterCode: t.starterCode,
    testCases: t.testCases,
    invoke: t.invoke,
    personalizedReason,
  };
}

function getPreferredCategories(profile: UserProfile | null): string[] {
  if (!profile) return CATEGORIES;
  const track = getCareerTrack(profile.goals.career);
  const trackCategories = TRACK_CATEGORY_MAP[track] || [];
  const skillNames = [
    ...profile.skills.learning.map((s) => s.name.toLowerCase()),
    ...profile.skills.known.map((s) => s.name.toLowerCase()),
  ];

  const skillCategories: string[] = [];
  if (skillNames.some((s) => ['react', 'javascript', 'html', 'css', 'node'].some((k) => s.includes(k)))) {
    skillCategories.push('Web Development');
  }
  if (skillNames.some((s) => ['sql', 'postgres', 'database'].some((k) => s.includes(k)))) {
    skillCategories.push('Database');
  }
  if (skillNames.some((s) => ['ai', 'machine learning', 'ml', 'data'].some((k) => s.includes(k)))) {
    skillCategories.push('AI');
  }
  if (skillNames.some((s) => ['security', 'cyber', 'auth'].some((k) => s.includes(k)))) {
    skillCategories.push('Cybersecurity');
  }

  return Array.from(new Set([...skillCategories, ...trackCategories, ...CATEGORIES]));
}

async function persistDailyAssignments(userId: string, challenges: ChallengeRecord[]) {
  if (!isSupabaseConfigured) return;
  const today = todayKey();
  const rows = challenges.map((challenge, index) => ({
    user_id: userId,
    challenge_date: today,
    slot: index + 1,
    challenge_key: challenge.id,
    category: challenge.type,
    difficulty: challenge.difficulty,
    title: challenge.title,
    xp_reward: challenge.xpReward,
    status: challenge.status === 'completed' ? 'completed' : 'open',
  }));
  const { error } = await supabase
    .from('daily_challenge_assignments')
    .upsert(rows, { onConflict: 'user_id,challenge_date,challenge_key' });
  if (error) console.warn('daily challenge persistence failed', error);
}

async function loadPersistedDailyAssignments(userId: string): Promise<ChallengeRecord[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('daily_challenge_assignments')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_date', todayKey())
    .order('slot');

  if (error || !data || data.length < 3) return null;

  return data
    .map((row) => {
      const bank = getArenaChallengeById(row.challenge_key);
      if (!bank) return null;
      return bankToRecord(
        bank,
        row.status === 'completed' ? 'completed' : 'open',
        `Matched to ${row.category}`
      );
    })
    .filter(Boolean) as ChallengeRecord[];
}

async function persistChallengeAttempt(
  userId: string,
  challenge: ChallengeRecord,
  code: string,
  passed: boolean,
  xpEarned: number
) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('challenge_attempts')
    .upsert({
      user_id: userId,
      challenge_key: challenge.id,
      challenge_type: challenge.type,
      difficulty: challenge.difficulty,
      submission: { code },
      passed,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,challenge_key' });
  if (error) console.warn('challenge attempt persistence failed', error);
}

async function markDailyAssignmentComplete(userId: string, challengeId: string) {
  if (!isSupabaseConfigured) return;
  await supabase
    .from('daily_challenge_assignments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('challenge_key', challengeId);
}

export const ChallengeService = {
  /** Full library: 50 arena challenges */
  getArenaLibrary(): ChallengeRecord[] {
    return ARENA_CHALLENGE_BANK.map((t) => bankToRecord(t));
  },

  getByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): ChallengeRecord[] {
    return ARENA_CHALLENGE_BANK.filter((c) => c.difficulty === difficulty).map((t) => bankToRecord(t));
  },

  async assignDailyChallenges(userId: string): Promise<ChallengeRecord[]> {
    const persisted = await loadPersistedDailyAssignments(userId);
    if (persisted) {
      const completed = await this.getCompletionMap(userId);
      return persisted.map((c) => ({ ...c, status: completed[c.id] ? 'completed' : c.status }));
    }

    const profile = await ProfileService.getProfile(userId);
    const preferred = getPreferredCategories(profile);
    const library = this.getArenaLibrary();
    const preferredPool = library.filter((c) => preferred.includes(c.type));
    const pool = preferredPool.length >= 6 ? preferredPool : library;
    const skillSeed = profile
      ? [
          profile.goals.career,
          ...profile.skills.learning.map((s) => s.name),
          ...profile.skills.known.map((s) => s.name),
        ].join('|')
      : 'careerforge';
    const seed = hashSeed(`${userId}-${todayKey()}-${skillSeed}`);

    const byDifficulty = {
      Easy: pool.filter((c) => c.difficulty === 'Easy'),
      Medium: pool.filter((c) => c.difficulty === 'Medium'),
      Hard: pool.filter((c) => c.difficulty === 'Hard'),
    };

    const pickedBase: ChallengeRecord[] = [
      ...seededPick<ChallengeRecord>(byDifficulty.Easy.length ? byDifficulty.Easy : library.filter((c) => c.difficulty === 'Easy'), seed + 11, 1),
      ...seededPick<ChallengeRecord>(byDifficulty.Medium.length ? byDifficulty.Medium : library.filter((c) => c.difficulty === 'Medium'), seed + 22, 1),
      ...seededPick<ChallengeRecord>(byDifficulty.Hard.length ? byDifficulty.Hard : library.filter((c) => c.difficulty === 'Hard'), seed + 33, 1),
    ];
    const picks = pickedBase.map((challenge) => ({
      ...challenge,
      personalizedReason: profile ? `Picked for ${profile.goals.career}` : 'Picked for today',
    }));

    const unique = Array.from(new Map(picks.map((c) => [c.id, c])).values());
    await persistDailyAssignments(userId, unique);
    return unique;
  },

  async getCompletionMap(userId: string): Promise<Record<string, boolean>> {
    const map: Record<string, boolean> = {};
    if (isSupabaseConfigured) {
      const { data: attempts } = await supabase
        .from('challenge_attempts')
        .select('challenge_key, passed')
        .eq('user_id', userId)
        .eq('passed', true);
      (attempts || []).forEach((row) => {
        map[row.challenge_key as string] = true;
      });

      const { data } = await supabase
        .from('challenge_completions')
        .select('challenge_id, passed')
        .eq('user_id', userId)
        .eq('passed', true);
      (data || []).forEach((row) => {
        map[row.challenge_id as string] = true;
      });
    }

    for (const c of ARENA_CHALLENGE_BANK) {
      const id = arenaChallengeId(c.id);
      if (!(id in map)) map[id] = await XPService.hasAwarded(userId, 'challenge', id);
    }
    return map;
  },

  mapRow(row: Record<string, unknown>): ChallengeRecord {
    const content = (row.content as Record<string, unknown>) || {};
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      type: normalizeCategory(row.type as string),
      difficulty: (content.difficulty as string) || 'Medium',
      xpReward: row.xp_reward as number,
      status: row.status as string,
      starterCode: content.starterCode as string,
      testCases: content.testCases as ChallengeRecord['testCases'],
      invoke: content.invoke as string | undefined,
    };
  },

  async getChallenge(challengeId: string, userId: string): Promise<ChallengeRecord | null> {
    const bank = getArenaChallengeById(challengeId);
    if (bank) {
      const id = arenaChallengeId(bank.id);
      const done = await this.isCompleted(userId, id);
      return bankToRecord(bank, done ? 'completed' : 'open');
    }

    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.from('challenges').select('*').eq('id', challengeId).eq('user_id', userId).single();
    return data ? this.mapRow(data) : null;
  },

  async isCompleted(userId: string, challengeId: string): Promise<boolean> {
    if (await XPService.hasAwarded(userId, 'challenge', challengeId)) return true;

    if (!isSupabaseConfigured) return false;

    const { data: attempt } = await supabase
      .from('challenge_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_key', challengeId)
      .eq('passed', true)
      .maybeSingle();
    if (attempt) return true;

    if (!isUuid(challengeId)) return false;

    const { data } = await supabase
      .from('challenge_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('passed', true)
      .maybeSingle();
    return !!data;
  },

  async submit(userId: string, challengeId: string, code: string): Promise<{ passed: boolean; awarded: boolean; leveledUp: boolean }> {
    const challenge = await this.getChallenge(challengeId, userId);
    if (!challenge) return { passed: false, awarded: false, leveledUp: false };

    const already = await this.isCompleted(userId, challenge.id);
    if (already) return { passed: true, awarded: false, leveledUp: false };

    const bank = getArenaChallengeById(challenge.id);
    const invoke = bank?.invoke || challenge.invoke;
    const passed = await ValidationService.validateChallenge(
      userId,
      challenge.id,
      code,
      challenge.testCases || [],
      invoke
    );

    if (!passed) {
      await persistChallengeAttempt(userId, challenge, code, false, 0);
      if (isSupabaseConfigured && isUuid(challenge.id)) {
        await supabase.from('challenge_completions').upsert({
          user_id: userId,
          challenge_id: challenge.id,
          submission: { code },
          passed: false,
          xp_earned: 0,
        });
      }
      return { passed: false, awarded: false, leveledUp: false };
    }

    if (isSupabaseConfigured && isUuid(challenge.id)) {
      await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', challenge.id);
      await supabase.from('challenge_completions').upsert({
        user_id: userId,
        challenge_id: challenge.id,
        submission: { code },
        passed: true,
        xp_earned: challenge.xpReward,
      });
    }

    const { awarded, leveledUp } = await XPService.awardOnce(userId, 'challenge', challenge.id, challenge.xpReward);
    await persistChallengeAttempt(userId, challenge, code, true, awarded ? challenge.xpReward : 0);

    if (awarded) {
      await markDailyAssignmentComplete(userId, challenge.id);
      await GoalService.recordEvent(userId, 'challenge');
      await MissionService.completeByTarget(userId, 'challenge');
    }

    return { passed: true, awarded, leveledUp };
  },

  categories: CATEGORIES,
};
