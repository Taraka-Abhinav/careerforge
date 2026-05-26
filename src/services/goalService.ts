import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { WeeklyGoal } from '../types';

type GoalMetric = NonNullable<WeeklyGoal['metric']>;

const GOAL_TEMPLATES: Array<{
  metric: GoalMetric;
  title: string;
  targetCount: number;
  targetRef: string;
}> = [
  { metric: 'lesson', title: 'Complete 3 lessons', targetCount: 3, targetRef: 'lesson' },
  { metric: 'challenge', title: 'Solve 5 challenges', targetCount: 5, targetRef: 'challenge' },
  { metric: 'milestone', title: 'Finish one roadmap milestone', targetCount: 1, targetRef: 'milestone' },
];

function weekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const local = new Date(monday.getTime() - monday.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function localGoalsKey(userId: string): string {
  return `weekly_goals_${userId}_${weekStartDate()}`;
}

function mapGoal(row: Record<string, unknown>): WeeklyGoal {
  return {
    id: row.id as string,
    title: row.title as string,
    targetCount: row.target_count as number,
    currentCount: row.current_count as number,
    status: row.status as WeeklyGoal['status'],
    xpReward: (row.xp_reward as number) || 0,
    metric: (row.metric as GoalMetric) || 'lesson',
    targetRef: row.target_ref as string | undefined,
  };
}

function getLocalGoals(userId: string): WeeklyGoal[] {
  const key = localGoalsKey(userId);
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as WeeklyGoal[];
  const goals = GOAL_TEMPLATES.map((t) => ({
    id: `${weekStartDate()}-${t.metric}`,
    title: t.title,
    targetCount: t.targetCount,
    currentCount: 0,
    status: 'active' as const,
    xpReward: 0,
    metric: t.metric,
    targetRef: t.targetRef,
  }));
  localStorage.setItem(key, JSON.stringify(goals));
  return goals;
}

function saveLocalGoals(userId: string, goals: WeeklyGoal[]) {
  localStorage.setItem(localGoalsKey(userId), JSON.stringify(goals));
}

export const GoalService = {
  async generateWeeklyGoals(userId: string): Promise<WeeklyGoal[]> {
    const weekStart = weekStartDate();
    if (!isSupabaseConfigured) return getLocalGoals(userId);

    const { data: existing, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .order('metric');

    if (error) {
      console.warn('weekly goal lookup failed', error);
      return [];
    }

    const existingGoals = (existing || []).map(mapGoal);
    const existingMetrics = new Set(existingGoals.map((g) => g.metric));
    const missing = GOAL_TEMPLATES.filter((t) => !existingMetrics.has(t.metric));

    if (missing.length > 0) {
      const { data: created, error: insertError } = await supabase
        .from('goals')
        .insert(missing.map((t) => ({
          user_id: userId,
          week_start: weekStart,
          title: t.title,
          metric: t.metric,
          target_ref: t.targetRef,
          target_count: t.targetCount,
          current_count: 0,
          status: 'active',
          xp_reward: 0,
        })))
        .select('*');

      if (insertError) {
        console.warn('weekly goal creation failed', insertError);
      } else {
        existingGoals.push(...(created || []).map(mapGoal));
      }
    }

    return existingGoals.sort((a, b) => {
      const order = ['lesson', 'challenge', 'milestone'];
      return order.indexOf(a.metric || 'lesson') - order.indexOf(b.metric || 'lesson');
    });
  },

  async generateWeeklyGoal(userId: string): Promise<WeeklyGoal | null> {
    const goals = await this.generateWeeklyGoals(userId);
    return goals[0] || null;
  },

  async recordEvent(userId: string, metric: GoalMetric, amount = 1): Promise<WeeklyGoal[]> {
    const goals = await this.generateWeeklyGoals(userId);
    const matching = goals.filter((g) => g.metric === metric && g.status === 'active');
    if (matching.length === 0) return goals;

    if (!isSupabaseConfigured) {
      const next = goals.map((goal) => {
        if (goal.metric !== metric || goal.status !== 'active') return goal;
        const currentCount = Math.min(goal.targetCount, goal.currentCount + amount);
        return {
          ...goal,
          currentCount,
          status: currentCount >= goal.targetCount ? 'completed' as const : 'active' as const,
        };
      });
      saveLocalGoals(userId, next);
      return next;
    }

    for (const goal of matching) {
      const currentCount = Math.min(goal.targetCount, goal.currentCount + amount);
      const status = currentCount >= goal.targetCount ? 'completed' : 'active';
      await supabase
        .from('goals')
        .update({
          current_count: currentCount,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id)
        .eq('user_id', userId);
    }

    return this.generateWeeklyGoals(userId);
  },

  async incrementProgress(userId: string, goalId: string): Promise<WeeklyGoal | null> {
    if (!isSupabaseConfigured) {
      const goals = getLocalGoals(userId);
      const next = goals.map((goal) => {
        if (goal.id !== goalId || goal.status !== 'active') return goal;
        const currentCount = Math.min(goal.targetCount, goal.currentCount + 1);
        return {
          ...goal,
          currentCount,
          status: currentCount >= goal.targetCount ? 'completed' as const : 'active' as const,
        };
      });
      saveLocalGoals(userId, next);
      return next.find((g) => g.id === goalId) || null;
    }

    const { data: goal } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();
    if (!goal || goal.status !== 'active') return goal ? mapGoal(goal) : null;

    const next = Math.min(goal.target_count, goal.current_count + 1);
    const completed = next >= goal.target_count;
    await supabase
      .from('goals')
      .update({
        current_count: next,
        status: completed ? 'completed' : 'active',
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId);

    return {
      ...mapGoal(goal),
      currentCount: next,
      status: completed ? 'completed' : 'active',
    };
  },
};
