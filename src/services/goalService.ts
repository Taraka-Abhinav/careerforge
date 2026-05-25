import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { WeeklyGoal } from '../types';

function weekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export const GoalService = {
  async generateWeeklyGoal(userId: string): Promise<WeeklyGoal | null> {
    const weekStart = weekStartDate();
    if (!isSupabaseConfigured) {
      return {
        id: 'g1',
        title: 'Master 3 skill modules',
        targetCount: 3,
        currentCount: 0,
        status: 'active',
        xpReward: 100,
      };
    }

    const { data: existing } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        title: existing.title,
        targetCount: existing.target_count,
        currentCount: existing.current_count,
        status: existing.status,
        xpReward: existing.xp_reward,
      };
    }

    const { data: created } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        week_start: weekStart,
        title: 'Complete 3 learning modules',
        target_count: 3,
        current_count: 0,
        status: 'active',
        xp_reward: 100,
      })
      .select('*')
      .single();

    if (!created) return null;
    return {
      id: created.id,
      title: created.title,
      targetCount: created.target_count,
      currentCount: created.current_count,
      status: created.status,
      xpReward: created.xp_reward,
    };
  },

  async incrementProgress(userId: string, goalId: string): Promise<WeeklyGoal | null> {
    if (!isSupabaseConfigured) return null;
    const { data: goal } = await supabase.from('goals').select('*').eq('id', goalId).single();
    if (!goal) return null;
    const next = goal.current_count + 1;
    const completed = next >= goal.target_count;
    await supabase
      .from('goals')
      .update({
        current_count: next,
        status: completed ? 'completed' : 'active',
      })
      .eq('id', goalId);

    if (completed) {
      const { XPService } = await import('./xpService');
      await XPService.awardOnce(userId, 'goal', goalId, goal.xp_reward);
    }

    return {
      id: goal.id,
      title: goal.title,
      targetCount: goal.target_count,
      currentCount: next,
      status: completed ? 'completed' : 'active',
      xpReward: goal.xp_reward,
    };
  },
};
