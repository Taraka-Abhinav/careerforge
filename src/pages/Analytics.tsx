import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Flame, Trophy, Target, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { ProgressTrackingService, type AnalyticsSnapshot } from '../services/progressTrackingService';
import { SubscriptionService } from '../services/subscriptionService';

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card className="p-5 border-white/5">
      <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase mb-2">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [canViewAdvanced, setCanViewAdvanced] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [s, allowed] = await Promise.all([
        ProgressTrackingService.getAnalytics(user.id),
        SubscriptionService.canUseFeature(user.id, 'advanced_analytics'),
      ]);
      setStats(s);
      setCanViewAdvanced(allowed);
      if (allowed) await SubscriptionService.trackFeatureUsage(user.id, 'advanced_analytics');
      setLoading(false);
    })();
  }, []);

  if (loading || !stats) {
    return (
      <AppShell>
        <div className="text-neutral-400 text-center py-20">Loading analytics...</div>
      </AppShell>
    );
  }

  const hasActivity = stats.xp > 0 || stats.lessonsCompleted > 0;
  const basicStats = [
    { label: 'Total XP', value: stats.xp.toLocaleString(), icon: Trophy },
    { label: 'Level', value: stats.level, icon: Target },
    { label: 'Daily Streak', value: `${stats.streakDays} days`, icon: Flame },
    { label: 'Weekly Streak', value: `${stats.weeklyStreak} weeks`, icon: Flame },
    { label: 'Best Streak', value: `${stats.longestStreak} days`, icon: Trophy },
    { label: 'Roadmap', value: `${stats.roadmapPercent}%`, icon: BookOpen },
  ];
  const advancedStats = [
    { label: 'Learning Time', value: `${stats.learningTimeMinutes} min`, icon: Clock },
    { label: 'Retention', value: `${stats.retentionRate}%`, icon: CheckCircle2 },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <BarChart3 className="text-indigo-400 w-10 h-10" /> Analytics
          </h1>
          <p className="text-neutral-400 mt-2">Real progress from your learning activity.</p>
        </header>

        {!hasActivity && (
          <Card className="p-6 border-amber-500/20 bg-amber-500/5 text-amber-200 text-sm">
            No activity yet. Complete a lesson, quiz, or challenge to see your stats here.
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {basicStats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
          ))}
          {canViewAdvanced && advancedStats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-white/5 space-y-4">
            <h3 className="font-bold text-white">Learning Progress</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-400">Lessons completed</span><span className="font-bold">{stats.lessonsCompleted}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Quiz completions</span><span className="font-bold">{stats.quizCompletions}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Skills mastered</span><span className="font-bold">{stats.skillsMastered}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Challenges solved</span><span className="font-bold">{stats.challengeCompletions}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Assessments passed</span><span className="font-bold">{stats.assessmentsPassed}</span></div>
            </div>
          </Card>

          {canViewAdvanced ? (
            <>
              <Card className="p-6 border-white/5 space-y-4">
                <h3 className="font-bold text-white">Performance</h3>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Challenge success rate</span>
                    <span className="font-bold">{stats.challengeSuccessRate}%</span>
                  </div>
                  <ProgressBar progress={stats.challengeSuccessRate} color="bg-emerald-500" containerClass="bg-neutral-950 h-2 rounded-full" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Quiz avg score</span>
                  <span className="font-bold">{stats.quizAvgScore}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-white/5">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold">DAU</div>
                    <div className="font-black text-white">{stats.dailyActiveUsers}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-white/5">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold">WAU</div>
                    <div className="font-black text-white">{stats.weeklyActiveUsers}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-white/5">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold">MAU</div>
                    <div className="font-black text-white">{stats.monthlyActiveUsers}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-white/5 md:col-span-2">
                <h3 className="font-bold text-white mb-4">XP Over Time</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-white/5">
                    <div className="text-xs text-neutral-500 mb-1">This week</div>
                    <div className="text-xl font-black text-indigo-400">+{stats.weeklyXp} XP</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-950 border border-white/5">
                    <div className="text-xs text-neutral-500 mb-1">This month</div>
                    <div className="text-xl font-black text-emerald-400">+{stats.monthlyXp} XP</div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6 border-amber-500/20 bg-amber-500/5 md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-amber-200">
                Advanced analytics are available with CareerForge Pro.
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
                View plans
              </Button>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
