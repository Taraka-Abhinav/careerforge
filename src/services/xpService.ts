import { supabase, isSupabaseConfigured } from '../supabase/client';
import { EngagementService, type EngagementEventType } from './engagementService';
import { ProgressService } from './progressService';
import type { UserProgress, XPSourceType } from '../types';

const XP_EARNING_SOURCES = new Set<XPSourceType>([
  'lesson',
  'quiz',
  'assessment',
  'challenge',
  'project',
]);

const EVENT_BY_SOURCE: Partial<Record<XPSourceType, EngagementEventType>> = {
  lesson: 'lesson_completed',
  quiz: 'quiz_completed',
  challenge: 'challenge_completed',
  assessment: 'assessment_completed',
  project: 'project_completed',
};

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
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

  isXpEarningSource(sourceType: XPSourceType): boolean {
    return XP_EARNING_SOURCES.has(sourceType);
  },

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
    if (!this.isXpEarningSource(sourceType) || xpAmount <= 0) {
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

      if (error) {
        if (error.code !== '23505') console.error('xp_events insert failed', error);
        const progress = await ProgressService.getProgress(userId);
        return { progress, leveledUp: false, awarded: false };
      }
    }

    const current = await ProgressService.getProgress(userId);
    const activeProgress = ProgressService.applyActivity(current);
    const newXp = activeProgress.xp + xpAmount;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > activeProgress.level;

    const updated: UserProgress = {
      ...activeProgress,
      xp: newXp,
      level: newLevel,
    };
    await ProgressService.saveProgress(userId, updated);

    const eventType = EVENT_BY_SOURCE[sourceType];
    if (eventType) {
      await EngagementService.trackEvent(userId, eventType, { sourceId, xpAmount });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp-updated', { detail: { progress: updated } }));
    }
    return { progress: updated, leveledUp, awarded: true };
  },
};

export type { XPSourceType };
