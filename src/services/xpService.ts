import { supabase, isSupabaseConfigured } from '../supabase/client';
import { ProgressService } from './progressService';
import type { UserProgress } from '../types';

export type XPSourceType =
  | 'lesson'
  | 'practice'
  | 'quiz'
  | 'assessment'
  | 'challenge'
  | 'project'
  | 'milestone'
  | 'mission'
  | 'goal'
  | 'module';

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function updateStreak(progress: UserProgress): number {
  const today = toDateString(new Date());
  const last = progress.lastActiveDate?.split('T')[0] || '';
  if (last === today) return progress.streakDays;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);
  if (last === yesterdayStr) return progress.streakDays + 1;
  return 1;
}

const localXpEventsKey = (userId: string) => `xp_events_${userId}`;

function getLocalXpEvents(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(localXpEventsKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalXpEvent(userId: string, key: string) {
  const set = getLocalXpEvents(userId);
  set.add(key);
  localStorage.setItem(localXpEventsKey(userId), JSON.stringify([...set]));
}

export const XPService = {
  calculateLevel,

  async hasAwarded(userId: string, sourceType: XPSourceType, sourceId: string): Promise<boolean> {
    const key = `${sourceType}:${sourceId}`;
    if (!isSupabaseConfigured) return getLocalXpEvents(userId).has(key);
    const { data } = await supabase
      .from('xp_events')
      .select('id')
      .eq('user_id', userId)
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .maybeSingle();
    return !!data;
  },

  async awardOnce(
    userId: string,
    sourceType: XPSourceType,
    sourceId: string,
    xpAmount: number
  ): Promise<{ progress: UserProgress; leveledUp: boolean; awarded: boolean }> {
    if (xpAmount <= 0) {
      const progress = await ProgressService.getProgress(userId);
      return { progress, leveledUp: false, awarded: false };
    }

    const already = await this.hasAwarded(userId, sourceType, sourceId);
    if (already) {
      const progress = await ProgressService.getProgress(userId);
      return { progress, leveledUp: false, awarded: false };
    }

    const key = `${sourceType}:${sourceId}`;
    if (!isSupabaseConfigured) {
      saveLocalXpEvent(userId, key);
    } else {
      const { error } = await supabase.from('xp_events').insert({
        user_id: userId,
        source_type: sourceType,
        source_id: sourceId,
        amount: xpAmount,
      });
      if (error && error.code !== '23505') {
        console.error('xp_events insert failed', error);
      }
    }

    const current = await ProgressService.getProgress(userId);
    const newXp = current.xp + xpAmount;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > current.level;
    const streakDays = updateStreak(current);

    const updated: UserProgress = {
      xp: newXp,
      level: newLevel,
      streakDays,
      lastActiveDate: new Date().toISOString(),
    };
    await ProgressService.saveProgress(userId, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp-updated', { detail: { progress: updated } }));
    }
    return { progress: updated, leveledUp, awarded: true };
  },
};
