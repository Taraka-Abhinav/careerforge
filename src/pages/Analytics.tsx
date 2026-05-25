import React, { useEffect, useState } from 'react';
import { BarChart3, Flame, Trophy, Target, BookOpen } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { supabase } from '../supabase/client';
import { ProgressTrackingService, type AnalyticsSnapshot } from '../services/progressTrackingService';

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

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const s = await ProgressTrackingService.getAnalytics(user.id);
      setStats(s);
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
          <StatCard label="Total XP" value={stats.xp.toLocaleString()} icon={Trophy} />
          <StatCard label="Level" value={stats.level} icon={Target} />
          <StatCard label="Streak" value={`${stats.streakDays} days`} icon={Flame} />
          <StatCard label="Roadmap" value={`${stats.roadmapPercent}%`} icon={BookOpen} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-white/5 space-y-4">
            <h3 className="font-bold text-white">Learning Progress</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-400">Lessons completed</span><span className="font-bold">{stats.lessonsCompleted}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Skills mastered</span><span className="font-bold">{stats.skillsMastered}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Challenges solved</span><span className="font-bold">{stats.challengesSolved}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Assessments passed</span><span className="font-bold">{stats.assessmentsPassed}</span></div>
            </div>
          </Card>

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
        </div>
      </div>
    </AppShell>
  );
}
