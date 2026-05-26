import { supabase, isSupabaseConfigured } from '../supabase/client';
import { EngagementService } from './engagementService';
import { ProgressService } from './progressService';
import { RoadmapEngine } from './roadmapEngine';

export interface AnalyticsSnapshot {
  xp: number;
  level: number;
  streakDays: number;
  weeklyStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  quizCompletions: number;
  skillsMastered: number;
  projectsCompleted: number;
  challengesSolved: number;
  challengeCompletions: number;
  assessmentsPassed: number;
  roadmapPercent: number;
  challengeSuccessRate: number;
  quizAvgScore: number;
  weeklyXp: number;
  monthlyXp: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  retentionRate: number;
  learningTimeMinutes: number;
}

export const ProgressTrackingService = {
  async getAnalytics(userId: string): Promise<AnalyticsSnapshot> {
    const progress = await ProgressService.getProgress(userId);
    const empty: AnalyticsSnapshot = {
      xp: progress.xp,
      level: progress.level,
      streakDays: progress.streakDays,
      weeklyStreak: progress.weeklyStreak || 0,
      longestStreak: progress.longestStreak || progress.streakDays || 0,
      lessonsCompleted: 0,
      quizCompletions: 0,
      skillsMastered: 0,
      projectsCompleted: 0,
      challengesSolved: 0,
      challengeCompletions: 0,
      assessmentsPassed: 0,
      roadmapPercent: 0,
      challengeSuccessRate: 0,
      quizAvgScore: 0,
      weeklyXp: 0,
      monthlyXp: 0,
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      retentionRate: 0,
      learningTimeMinutes: 0,
    };

    if (!isSupabaseConfigured) {
      const localEvents = EngagementService.getLocalEvents(userId);
      const activeDays = new Set(localEvents.map((event) => event.eventDate));
      return {
        ...empty,
        dailyActiveUsers: activeDays.has(ProgressService.toLocalDateString()) ? 1 : 0,
        weeklyActiveUsers: new Set(localEvents.slice(0, 50).map((event) => event.eventDate)).size,
        monthlyActiveUsers: activeDays.size,
        retentionRate: Math.min(100, Math.round((activeDays.size / 30) * 100)),
        learningTimeMinutes: Math.round(localEvents.reduce((sum, event) => sum + (event.durationSeconds || 0), 0) / 60),
      };
    }

    const [
      skillsRes,
      quizRes,
      xpWeekRes,
      xpMonthRes,
      activityRes,
      phases,
    ] = await Promise.all([
      supabase.from('skills').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'Mastered'),
      supabase.from('quiz_attempts').select('score, passed').eq('user_id', userId),
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
      supabase
        .from('activity_events')
        .select('event_date, event_type, duration_seconds')
        .eq('user_id', userId)
        .gte('event_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]),
      RoadmapEngine.getPhases(userId),
    ]);

    const totalSkills = phases.flatMap((p) => p.items.filter((i) => i.type === 'skill')).length;
    const mastered = skillsRes.count || 0;
    const roadmapPercent = totalSkills ? Math.round((mastered / totalSkills) * 100) : 0;

    const quizScores = (quizRes.data || []).map((q) => q.score);
    const quizAvg = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
    const quizCompletions = quizRes.data?.length || 0;

    const { data: challengeAttempts } = await supabase
      .from('challenge_attempts')
      .select('challenge_key, passed')
      .eq('user_id', userId);
    const challengeAttemptTotal = challengeAttempts?.length || 0;
    const challengeAttemptSolved = (challengeAttempts || []).filter((row) => row.passed).length;

    const { count: legacyChallengeTotal } = await supabase
      .from('challenge_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    const { count: legacyChallengeSolved } = await supabase
      .from('challenge_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('passed', true);
    const challengeTotal = challengeAttemptTotal || legacyChallengeTotal || 0;
    const solved = challengeAttemptSolved || legacyChallengeSolved || 0;
    const challengeSuccessRate = challengeTotal ? Math.round((solved / challengeTotal) * 100) : 0;

    const { data: completedModules } = await supabase
      .from('user_module_progress')
      .select('module_id, learning_modules(type)')
      .eq('user_id', userId)
      .eq('status', 'completed');

    let assessmentsPassed = 0;
    let projectsCompleted = 0;
    let lessonsCompleted = 0;
    (completedModules || []).forEach((row: { learning_modules?: { type?: string } | { type?: string }[] }) => {
      const mod = Array.isArray(row.learning_modules) ? row.learning_modules[0] : row.learning_modules;
      if (mod?.type === 'lesson') lessonsCompleted++;
      if (mod?.type === 'assessment') assessmentsPassed++;
      if (mod?.type === 'project') projectsCompleted++;
    });

    const weeklyXp = (xpWeekRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);
    const monthlyXp = (xpMonthRes.data || []).reduce((s, e) => s + (e.amount || 0), 0);
    const activityEvents = activityRes.data || [];
    const activeDays = new Set(activityEvents.map((event) => event.event_date as string));
    const weekStart = ProgressService.weekStartDate();
    const weeklyActiveDays = new Set(
      activityEvents
        .filter((event) => (event.event_date as string) >= weekStart)
        .map((event) => event.event_date as string)
    );
    const learningTimeMinutes = Math.round(
      activityEvents.reduce((sum, event) => sum + (event.duration_seconds || 0), 0) / 60
    );

    return {
      ...empty,
      lessonsCompleted,
      quizCompletions,
      skillsMastered: mastered,
      projectsCompleted,
      challengesSolved: solved,
      challengeCompletions: solved,
      assessmentsPassed,
      roadmapPercent,
      challengeSuccessRate,
      quizAvgScore: quizAvg,
      weeklyXp,
      monthlyXp,
      dailyActiveUsers: activeDays.has(ProgressService.toLocalDateString()) ? 1 : 0,
      weeklyActiveUsers: weeklyActiveDays.size,
      monthlyActiveUsers: activeDays.size,
      retentionRate: Math.min(100, Math.round((activeDays.size / 30) * 100)),
      learningTimeMinutes,
    };
  },
};
