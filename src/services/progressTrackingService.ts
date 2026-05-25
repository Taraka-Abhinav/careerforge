import { supabase, isSupabaseConfigured } from '../supabase/client';
import { ProgressService } from './progressService';
import { RoadmapEngine } from './roadmapEngine';

export interface AnalyticsSnapshot {
  xp: number;
  level: number;
  streakDays: number;
  lessonsCompleted: number;
  skillsMastered: number;
  projectsCompleted: number;
  challengesSolved: number;
  assessmentsPassed: number;
  roadmapPercent: number;
  challengeSuccessRate: number;
  quizAvgScore: number;
  weeklyXp: number;
  monthlyXp: number;
}

export const ProgressTrackingService = {
  async getAnalytics(userId: string): Promise<AnalyticsSnapshot> {
    const progress = await ProgressService.getProgress(userId);
    const empty: AnalyticsSnapshot = {
      xp: progress.xp,
      level: progress.level,
      streakDays: progress.streakDays,
      lessonsCompleted: 0,
      skillsMastered: 0,
      projectsCompleted: 0,
      challengesSolved: 0,
      assessmentsPassed: 0,
      roadmapPercent: 0,
      challengeSuccessRate: 0,
      quizAvgScore: 0,
      weeklyXp: 0,
      monthlyXp: 0,
    };

    if (!isSupabaseConfigured) return empty;

    const [
      modulesRes,
      skillsRes,
      challengesRes,
      quizRes,
      xpWeekRes,
      xpMonthRes,
      phases,
    ] = await Promise.all([
      supabase.from('user_module_progress').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
      supabase.from('skills').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'Mastered'),
      supabase.from('challenge_completions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('passed', true),
      supabase.from('quiz_attempts').select('score').eq('user_id', userId),
      supabase
        .from('xp_events')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase
        .from('xp_events')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      RoadmapEngine.getPhases(userId),
    ]);

    const totalSkills = phases.flatMap((p) => p.items.filter((i) => i.type === 'skill')).length;
    const mastered = skillsRes.count || 0;
    const roadmapPercent = totalSkills ? Math.round((mastered / totalSkills) * 100) : 0;

    const quizScores = (quizRes.data || []).map((q) => q.score);
    const quizAvg = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

    const { count: challengeTotal } = await supabase
      .from('challenge_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    const solved = challengesRes.count || 0;
    const challengeSuccessRate = challengeTotal ? Math.round((solved / challengeTotal) * 100) : 0;

    const { data: completedModules } = await supabase
      .from('user_module_progress')
      .select('module_id, learning_modules(type)')
      .eq('user_id', userId)
      .eq('status', 'completed');

    let assessmentsPassed = 0;
    let projectsCompleted = 0;
    (completedModules || []).forEach((row: { learning_modules?: { type?: string } | { type?: string }[] }) => {
      const mod = Array.isArray(row.learning_modules) ? row.learning_modules[0] : row.learning_modules;
      if (mod?.type === 'assessment') assessmentsPassed++;
      if (mod?.type === 'project') projectsCompleted++;
    });

    const weeklyXp = (xpWeekRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);
    const monthlyXp = (xpMonthRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);

    return {
      ...empty,
      lessonsCompleted: modulesRes.count || 0,
      skillsMastered: mastered,
      projectsCompleted,
      challengesSolved: solved,
      assessmentsPassed,
      roadmapPercent,
      challengeSuccessRate,
      quizAvgScore: quizAvg,
      weeklyXp,
      monthlyXp,
    };
  },
};
