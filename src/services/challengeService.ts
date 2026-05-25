import { supabase, isSupabaseConfigured } from '../supabase/client';
import {
  ARENA_CHALLENGE_BANK,
  arenaChallengeId,
  getArenaChallengeById,
} from '../content/challengeBank';
import { ValidationService } from './validationService';
import { XPService } from './xpService';
import type { ChallengeRecord } from '../types';

const CATEGORIES = ['Coding', 'Debugging', 'Logic', 'Database', 'AI', 'Cybersecurity', 'System Design', 'Frontend', 'Backend'];

function bankToRecord(t: (typeof ARENA_CHALLENGE_BANK)[0], status = 'open'): ChallengeRecord {
  return {
    id: arenaChallengeId(t.id),
    title: t.title,
    description: t.description,
    type: t.category,
    difficulty: t.difficulty,
    xpReward: t.xpReward,
    status,
    starterCode: t.starterCode,
    testCases: t.testCases,
    invoke: t.invoke,
  };
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
    const library = this.getArenaLibrary();
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pick = (arr: ChallengeRecord[], n: number) => {
      const copy = [...arr];
      const out: ChallengeRecord[] = [];
      let s = seed;
      while (out.length < n && copy.length) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        out.push(copy.splice(s % copy.length, 1)[0]);
      }
      return out;
    };
    const easy = library.filter((c) => c.difficulty === 'Easy');
    const med = library.filter((c) => c.difficulty === 'Medium');
    const hard = library.filter((c) => c.difficulty === 'Hard');
    return [...pick(easy, 1), ...pick(med, 1), ...pick(hard, 1)];
  },

  async getCompletionMap(userId: string): Promise<Record<string, boolean>> {
    const map: Record<string, boolean> = {};
    if (!isSupabaseConfigured) {
      for (const c of ARENA_CHALLENGE_BANK) {
        const id = arenaChallengeId(c.id);
        map[id] = await XPService.hasAwarded(userId, 'challenge', id);
      }
      return map;
    }
    const { data } = await supabase
      .from('challenge_completions')
      .select('challenge_id, passed')
      .eq('user_id', userId)
      .eq('passed', true);
    (data || []).forEach((row) => {
      map[row.challenge_id as string] = true;
    });
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
      type: row.type as string,
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
      const done = await this.isCompleted(userId, arenaChallengeId(bank.id));
      return bankToRecord(bank, done ? 'completed' : 'open');
    }

    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.from('challenges').select('*').eq('id', challengeId).eq('user_id', userId).single();
    return data ? this.mapRow(data) : null;
  },

  async isCompleted(userId: string, challengeId: string): Promise<boolean> {
    if (await XPService.hasAwarded(userId, 'challenge', challengeId)) return true;
    if (!isSupabaseConfigured) return false;
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

    const already = await this.isCompleted(userId, challengeId);
    if (already) return { passed: true, awarded: false, leveledUp: false };

    const bank = getArenaChallengeById(challengeId);
    const invoke = bank?.invoke || challenge.invoke;
    const passed = await ValidationService.validateChallenge(
      userId,
      challengeId,
      code,
      challenge.testCases || [],
      invoke
    );

    if (!passed) {
      if (isSupabaseConfigured && !challengeId.startsWith('arena-')) {
        await supabase.from('challenge_completions').upsert({
          user_id: userId,
          challenge_id: challengeId,
          submission: { code },
          passed: false,
          xp_earned: 0,
        });
      }
      return { passed: false, awarded: false, leveledUp: false };
    }

    if (isSupabaseConfigured && !challengeId.startsWith('arena-')) {
      await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', challengeId);
      await supabase.from('challenge_completions').upsert({
        user_id: userId,
        challenge_id: challengeId,
        submission: { code },
        passed: true,
        xp_earned: challenge.xpReward,
      });
    }

    const { awarded, leveledUp } = await XPService.awardOnce(userId, 'challenge', challengeId, challenge.xpReward);
    return { passed: true, awarded, leveledUp };
  },

  categories: CATEGORIES,
};
