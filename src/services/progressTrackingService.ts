import { supabase, isSupabaseConfigured } from '../supabase/client';
import { EngagementService } from './engagementService';
import { ProgressService } from './progressService';
import { RoadmapEngine } from './roadmapEngine';
import { ProfileService } from './profileService';

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

export interface AIRecommendation {
  id: string;
  title: string;
  type: 'skill' | 'challenge' | 'project';
  reason: string;
  actionUrl: string;
}

export interface WeeklyReportSection {
  title: string;
  content: string;
}

export interface WeeklyReport {
  title: string;
  summary: string;
  sections: WeeklyReportSection[];
  careerReadinessScore: number;
}

export interface PersonalizedInsights {
  strongestSkills: string[];
  weakestSkills: string[];
  mostImprovedSkill: string;
  learningEfficiency: number;
  studyConsistency: number;
  careerReadinessTrend: number[];
  recommendations: AIRecommendation[];
  weeklyReport: WeeklyReport;
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

  async getPersonalizedInsights(userId: string): Promise<PersonalizedInsights | null> {
    const profile = await ProfileService.getProfile(userId);
    if (!profile) return null;
    const stats = await this.getAnalytics(userId);

    const career = profile.goals.career;
    const knownSkills = profile.skills.known.map((s) => s.name);
    const learningSkills = profile.skills.learning.map((s) => s.name);

    const strongestSkills = knownSkills.length ? knownSkills.slice(0, 3) : ['Git', 'Command Line', 'Problem Solving'];
    const weakestSkills = learningSkills.length ? learningSkills.slice(0, 3) : ['Advanced Architectures', 'System Integration', 'Optimizations'];
    const mostImprovedSkill = learningSkills[0] || knownSkills[0] || 'Fundamentals';

    const learningEfficiency = Math.min(95, Math.max(45, Math.round((stats.xp / (stats.learningTimeMinutes || 60)) * 12)));
    const studyConsistency = Math.min(100, Math.max(20, stats.streakDays * 15 + stats.weeklyActiveUsers * 10));

    const baseScore = 40;
    const masteredWeight = profile.skills.known.length * 8;
    const learningWeight = profile.skills.learning.length * 2;
    const readinessScore = Math.min(98, baseScore + masteredWeight + learningWeight + Math.round(stats.xp / 100));
    const careerReadinessTrend = [
      Math.max(30, readinessScore - 12),
      Math.max(35, readinessScore - 8),
      Math.max(38, readinessScore - 5),
      Math.max(40, readinessScore - 2),
      readinessScore,
    ];

    let recommendations: AIRecommendation[] = [];
    let weeklyReport: WeeklyReport = {
      title: 'Career Mastery Brief',
      summary: 'Your matrix of skills shows active growth. Focus on code quality and integration practices.',
      sections: [],
      careerReadinessScore: readinessScore,
    };

    if (career.includes('AI') || career.includes('Machine Learning')) {
      recommendations = [
        {
          id: 'rec-1',
          title: 'Master PyTorch Tensors',
          type: 'skill',
          reason: 'Deep learning frameworks require solid multidimensional tensor operation mechanics.',
          actionUrl: '/learn/pytorch',
        },
        {
          id: 'rec-2',
          title: 'Solve Tokenize Words',
          type: 'challenge',
          reason: 'Practicing text parsing builds solid fundamentals for natural language processing models.',
          actionUrl: '/challenges',
        },
      ];
      weeklyReport = {
        title: 'Weekly AI & ML Systems Brief',
        summary: 'Machine learning platforms require scaling data preprocessing and neural pipelines efficiently.',
        sections: [
          {
            title: 'Technical Focus',
            content: 'Verify matrix operations are vectorized. Non-vectorized operations create compute performance bottlenecks at scale.',
          },
          {
            title: 'SaaS Integration',
            content: 'Production AI is 90% software engineering and 10% modeling. Optimize your training pipelines for reproducible CI/CD runs.',
          },
        ],
        careerReadinessScore: readinessScore,
      };
    } else if (career.includes('Frontend')) {
      recommendations = [
        {
          id: 'rec-1',
          title: 'React Custom Hooks',
          type: 'skill',
          reason: 'Encapsulating state patterns in custom hooks dramatically cleans up render behavior.',
          actionUrl: '/learn/react',
        },
        {
          id: 'rec-2',
          title: 'Solve Debounce Result',
          type: 'challenge',
          reason: 'Debouncing client inputs reduces unnecessary API backend request spam.',
          actionUrl: '/challenges',
        },
      ];
      weeklyReport = {
        title: 'Weekly Frontend Architecture Brief',
        summary: 'Modern client architectures optimize for initial paint metrics and predictable state container bindings.',
        sections: [
          {
            title: 'Performance Insight',
            content: 'Profile slow renders and memoize expensive computations. Ensure bundle chunks are lazy loaded where appropriate.',
          },
          {
            title: 'UX Strategy',
            content: 'Modern users demand absolute fluid response. Focus on loading skeletons and optimistic UI updates on critical paths.',
          },
        ],
        careerReadinessScore: readinessScore,
      };
    } else if (career.includes('Data Scientist') || career.includes('Data Engineer')) {
      recommendations = [
        {
          id: 'rec-1',
          title: 'PostgreSQL Index Design',
          type: 'skill',
          reason: 'Covering and partial indexes speed up query response times on millions of rows.',
          actionUrl: '/learn/postgresql',
        },
        {
          id: 'rec-2',
          title: 'Solve Group By Category',
          type: 'challenge',
          reason: 'Grouping and aggregating transaction rows is a daily routine in analytics engineering.',
          actionUrl: '/challenges',
        },
      ];
      weeklyReport = {
        title: 'Weekly Data Science & Analytics Brief',
        summary: 'Analytics platforms require rigorous statistical verification and optimized data pipelines.',
        sections: [
          {
            title: 'Statistical Rigor',
            content: 'Always split train/test datasets cleanly to avoid information leakage. Verify target labels are balanced.',
          },
          {
            title: 'Pipeline Engineering',
            content: 'Relational query optimization directly affects cloud billing. Avoid nested subqueries; opt for index scans and CTEs.',
          },
        ],
        careerReadinessScore: readinessScore,
      };
    } else if (career.includes('Cybersecurity')) {
      recommendations = [
        {
          id: 'rec-1',
          title: 'OWASP Top 10 Auditing',
          type: 'skill',
          reason: 'Understanding SQL injection and cross-site scripting lets you secure server runtimes.',
          actionUrl: '/learn/cybersecurity',
        },
        {
          id: 'rec-2',
          title: 'Solve Sanitize HTML',
          type: 'challenge',
          reason: 'Filtering malicious markup protects browser clients from executing unsafe scripts.',
          actionUrl: '/challenges',
        },
      ];
      weeklyReport = {
        title: 'Weekly Cybersecurity Guard Brief',
        summary: 'Enterprise architectures must follow zero-trust designs and enforce tight input validation.',
        sections: [
          {
            title: 'Security Focus',
            content: 'Verify all API input boundaries sanitize string parameters to prevent buffer overflows or injection tricks.',
          },
          {
            title: 'Compliance & Audit',
            content: 'Implement detailed audit trails. Store log records in tamper-resistant log repositories for post-incident review.',
          },
        ],
        careerReadinessScore: readinessScore,
      };
    } else if (career.includes('Mechanical')) {
      recommendations = [
        {
          id: 'rec-1',
          title: 'CAD Parametric Constraints',
          type: 'skill',
          reason: 'Modeling design variables with parametric formulas lets you modify parts seamlessly.',
          actionUrl: '/learn/cad',
        },
        {
          id: 'rec-2',
          title: 'Solve Robotic Link FK',
          type: 'challenge',
          reason: 'Forward kinematics calculations form the core trajectory planning layer in robotic controllers.',
          actionUrl: '/challenges',
        },
      ];
      weeklyReport = {
        title: 'Weekly Mechanical & Robotics Brief',
        summary: 'Modern hardware-software engineering links parametric physical design to algorithmic controls.',
        sections: [
          {
            title: 'Parametric Rigor',
            content: 'Ensure 3D assemblies verify clearance tolerances. Use FEM simulations to calculate structural safety factors.',
          },
          {
            title: 'Controls & Kinematics',
            content: 'Robotic trajectory planning requires precise coordinate transformations. Validate inverse kinematics models against physical joint stops.',
          },
        ],
        careerReadinessScore: readinessScore,
      };
    } else {
      recommendations = [
        {
          id: 'rec-1',
          title: 'System Design Patterns',
          type: 'skill',
          reason: 'Clean software architecture separates database concerns from client controllers.',
          actionUrl: '/learn/system-design',
        },
        {
          id: 'rec-2',
          title: 'Solve FizzBuzz Label',
          type: 'challenge',
          reason: 'Basic control flow loops form the foundation of algorithm correctness.',
          actionUrl: '/challenges',
        },
      ];
      weeklyReport = {
        title: 'Weekly General Engineering Brief',
        summary: 'Scaling products require high maintainability, unit tests, and continuous monitoring.',
        sections: [
          {
            title: 'Code Health',
            content: 'Implement detailed error handling in controllers. Do not let exceptions bubble up and crash runtime systems.',
          },
          {
            title: 'Observability',
            content: 'Instrument services with simple execution timers. Track request rates and error counts to detect incidents early.',
          },
        ],
        careerReadinessScore: readinessScore,
      };
    }

    return {
      strongestSkills,
      weakestSkills,
      mostImprovedSkill,
      learningEfficiency,
      studyConsistency,
      careerReadinessTrend,
      recommendations,
      weeklyReport,
    };
  },
};
