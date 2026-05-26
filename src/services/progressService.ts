import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { UserProgress } from '../types';

function toLocalDateString(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function normalizeDate(value?: string): string {
  return value ? value.split('T')[0] : '';
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function weekStartDate(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toLocalDateString(d);
}

function previousWeekStart(date = new Date()): string {
  return weekStartDate(addDays(date, -7));
}

function fallbackProgress(): UserProgress {
  return {
    xp: 0,
    level: 1,
    streakDays: 0,
    weeklyStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    lastWeeklyActive: '',
  };
}

function normalizeProgress(progress: Partial<UserProgress> | null | undefined): UserProgress {
  const streakDays = progress?.streakDays || 0;
  return {
    xp: progress?.xp || 0,
    level: progress?.level || 1,
    streakDays,
    weeklyStreak: progress?.weeklyStreak || 0,
    longestStreak: progress?.longestStreak || streakDays,
    lastActiveDate: progress?.lastActiveDate || '',
    lastWeeklyActive: progress?.lastWeeklyActive || '',
  };
}

export const ProgressService = {
  toLocalDateString,
  weekStartDate,

  applyActivity(progress: UserProgress): UserProgress {
    const current = normalizeProgress(progress);
    const now = new Date();
    const today = toLocalDateString(now);
    const lastActive = normalizeDate(current.lastActiveDate);
    const yesterday = toLocalDateString(addDays(now, -1));

    let dailyStreak = current.streakDays;
    if (lastActive === today) {
      dailyStreak = current.streakDays;
    } else if (lastActive === yesterday) {
      dailyStreak = current.streakDays + 1;
    } else {
      dailyStreak = 1;
    }

    const thisWeek = weekStartDate(now);
    const lastWeeklyActive = normalizeDate(current.lastWeeklyActive);
    let weeklyStreak = current.weeklyStreak || 0;
    if (lastWeeklyActive === thisWeek) {
      weeklyStreak = current.weeklyStreak || 1;
    } else if (lastWeeklyActive === previousWeekStart(now)) {
      weeklyStreak = (current.weeklyStreak || 0) + 1;
    } else {
      weeklyStreak = 1;
    }

    return {
      ...current,
      streakDays: dailyStreak,
      weeklyStreak,
      longestStreak: Math.max(current.longestStreak || 0, dailyStreak),
      lastActiveDate: today,
      lastWeeklyActive: thisWeek,
    };
  },

  async ensureProgress(userId: string): Promise<UserProgress> {
    const existing = await this.getProgress(userId);
    if (existing.xp === 0 && existing.level === 1 && !existing.lastActiveDate) {
      await this.saveProgress(userId, existing);
    }
    return existing;
  },

  async getProgress(userId: string): Promise<UserProgress> {
    const fallback = fallbackProgress();
    const cachedRaw = localStorage.getItem(`progress_${userId}`);
    const cached = cachedRaw ? normalizeProgress(JSON.parse(cachedRaw) as UserProgress) : null;

    if (!isSupabaseConfigured) {
      return cached || fallback;
    }

    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        if (cached) return cached;
        await this.saveProgress(userId, fallback);
        return fallback;
      }

      return normalizeProgress({
        xp: data.xp || 0,
        level: data.level || 1,
        streakDays: data.streak_days || 0,
        weeklyStreak: data.weekly_streak || 0,
        longestStreak: data.longest_streak || data.streak_days || 0,
        lastActiveDate: data.last_active_date || '',
        lastWeeklyActive: data.last_weekly_active || '',
      });
    } catch (e) {
      console.error('Supabase progress retrieval failed, loading local', e);
      return cached || fallback;
    }
  },

  async saveProgress(userId: string, record: UserProgress): Promise<boolean> {
    const normalized = normalizeProgress(record);
    localStorage.setItem(`progress_${userId}`, JSON.stringify(normalized));

    if (!isSupabaseConfigured) return true;

    const basePayload = {
      user_id: userId,
      xp: normalized.xp,
      level: normalized.level,
      streak_days: normalized.streakDays,
      last_active_date: normalized.lastActiveDate || null,
      updated_at: new Date().toISOString(),
    };

    const extendedPayload = {
      ...basePayload,
      weekly_streak: normalized.weeklyStreak || 0,
      longest_streak: normalized.longestStreak || normalized.streakDays || 0,
      last_weekly_active: normalized.lastWeeklyActive || null,
    };

    try {
      const { error } = await supabase.from('progress').upsert(extendedPayload);
      if (!error) return true;

      const { error: fallbackError } = await supabase.from('progress').upsert(basePayload);
      return !fallbackError;
    } catch (e) {
      console.error('Failed to update Supabase progress metrics', e);
      return false;
    }
  },

  async recordActivity(userId: string): Promise<UserProgress> {
    const current = await this.getProgress(userId);
    const next = this.applyActivity(current);
    await this.saveProgress(userId, next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp-updated', { detail: { progress: next } }));
    }
    return next;
  },
};
