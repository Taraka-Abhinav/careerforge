import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { UserProgress } from '../types';

export const ProgressService = {
  async ensureProgress(userId: string): Promise<UserProgress> {
    const existing = await this.getProgress(userId);
    if (existing.xp === 0 && existing.level === 1) {
      await this.saveProgress(userId, existing);
    }
    return existing;
  },

  async getProgress(userId: string): Promise<UserProgress> {
    const fallback: UserProgress = {
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: new Date().toISOString()
    };

    const cachedRaw = localStorage.getItem(`progress_${userId}`);
    const cached = cachedRaw ? JSON.parse(cachedRaw) as UserProgress : null;

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

      return {
        xp: data.xp || 0,
        level: data.level || 1,
        streakDays: data.streak_days || 0,
        lastActiveDate: data.last_active_date || new Date().toISOString()
      };
    } catch (e) {
      console.error('Supabase progress retrieval failed, loading local', e);
      return cached || fallback;
    }
  },

  async saveProgress(userId: string, record: UserProgress): Promise<boolean> {
    localStorage.setItem(`progress_${userId}`, JSON.stringify(record));

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: userId,
          xp: record.xp,
          level: record.level,
          streak_days: record.streakDays,
          last_active_date: record.lastActiveDate,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (e) {
      console.error('Failed to update Supabase progress metrics', e);
      return false;
    }
  }
};