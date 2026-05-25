import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { Mission } from '../types';

export const MissionService = {
  async generateDailyMissions(userId: string): Promise<Mission[]> {
    const today = new Date().toISOString().split('T')[0];
    if (!isSupabaseConfigured) {
      return [
        { id: 'm1', title: 'Complete a lesson module', type: 'lesson', isCompleted: false, xpReward: 10, targetRef: 'lesson' },
        { id: 'm2', title: 'Solve today\'s coding challenge', type: 'challenge', isCompleted: false, xpReward: 25, targetRef: 'challenge' },
      ];
    }

    const { data: existing } = await supabase.from('missions').select('*').eq('user_id', userId).eq('date', today);
    if (existing && existing.length > 0) {
      return existing.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type as Mission['type'],
        isCompleted: m.is_completed,
        xpReward: m.xp_reward,
        targetRef: m.target_ref,
      }));
    }

    const templates = [
      { title: 'Complete one learning module', type: 'lesson', xp_reward: 15, target_ref: 'module' },
      { title: 'Solve a daily coding challenge', type: 'challenge', xp_reward: 25, target_ref: 'challenge' },
    ];

    const { data: created } = await supabase
      .from('missions')
      .insert(templates.map((t) => ({ ...t, user_id: userId, date: today })))
      .select('*');

    return (created || []).map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type as Mission['type'],
      isCompleted: m.is_completed,
      xpReward: m.xp_reward,
      targetRef: m.target_ref,
    }));
  },

  async getMissions(userId: string): Promise<Mission[]> {
    const today = new Date().toISOString().split('T')[0];
    if (!isSupabaseConfigured) return this.generateDailyMissions(userId);
    const { data } = await supabase.from('missions').select('*').eq('user_id', userId).eq('date', today);
    return (data || []).map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type as Mission['type'],
      isCompleted: m.is_completed,
      xpReward: m.xp_reward,
      targetRef: m.target_ref,
    }));
  },

  async completeMission(userId: string, missionId: string, xpReward: number) {
    if (isSupabaseConfigured) {
      await supabase.from('missions').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', missionId);
    }
    const { XPService } = await import('./xpService');
    return XPService.awardOnce(userId, 'mission', missionId, xpReward);
  },
};
