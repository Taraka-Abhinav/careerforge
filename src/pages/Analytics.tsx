import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Flame, Trophy, Target, BookOpen, Clock, CheckCircle2, BrainCircuit, Sparkles, Sparkle, Lock, ArrowUpRight } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../supabase/client';
import { ProgressTrackingService, type AnalyticsSnapshot, type PersonalizedInsights } from '../services/progressTrackingService';
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
  const [insights, setInsights] = useState<PersonalizedInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [canViewAdvanced, setCanViewAdvanced] = useState(true);
  const [canViewRecommendations, setCanViewRecommendations] = useState(true);
  const [canViewReports, setCanViewReports] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [s, allowed, allowedRecs, allowedReports] = await Promise.all([
        ProgressTrackingService.getAnalytics(user.id),
        SubscriptionService.canUseFeature(user.id, 'advanced_analytics'),
        SubscriptionService.canUseFeature(user.id, 'personalized_recommendations'),
        SubscriptionService.canUseFeature(user.id, 'personalized_weekly_reports'),
      ]);
      setStats(s);
      setCanViewAdvanced(allowed);
      setCanViewRecommendations(allowedRecs);
      setCanViewReports(allowedReports);
      
      const ins = await ProgressTrackingService.getPersonalizedInsights(user.id);
      setInsights(ins);

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

        {/* Personalized AI Recommendations Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-indigo-400" /> Strategic AI Recommendations
          </h2>
          {canViewRecommendations && insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.recommendations.map((rec) => (
                <Card key={rec.id} className="p-5 border-indigo-500/10 bg-indigo-500/5 relative hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                        Target {rec.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base">{rec.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{rec.reason}</p>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button size="sm" icon={<ArrowUpRight className="w-4 h-4" />} onClick={() => navigate(rec.actionUrl)}>
                      Start Task
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 bg-neutral-900/40">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-neutral-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="font-bold text-white">Unlock AI Recommendations</h4>
                <p className="text-xs text-neutral-400">Get strategic next steps mapping precisely to your weak spots and career goals.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
                Upgrade to Pro
              </Button>
            </Card>
          )}
        </section>

        {/* Personalized Weekly Reports Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BrainCircuit className="w-6 h-6 text-emerald-400" /> Weekly Career Mastery Report
          </h2>
          {canViewReports && insights ? (
            <Card className="p-6 border-white/5 bg-gradient-to-b from-neutral-900 to-neutral-950 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-black text-white">{insights.weeklyReport.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{insights.weeklyReport.summary}</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-neutral-400">Readiness Score</div>
                    <div className="text-xl font-black text-emerald-400">{insights.weeklyReport.careerReadinessScore}%</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-neutral-400">Trend</div>
                    <div className="text-xs font-semibold text-neutral-300">
                      {insights.careerReadinessTrend.join(' ➔ ')}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights Grid */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-neutral-400">Skills Analysis</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-neutral-500">Strongest:</span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {insights.strongestSkills.map(s => <Badge key={s} color="emerald">{s}</Badge>)}
                        </div>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-neutral-500">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {insights.weakestSkills.map(s => <Badge key={s} color="amber">{s}</Badge>)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Most Improved:</span>
                        <span className="font-bold text-indigo-400">{insights.mostImprovedSkill}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-neutral-400">Learning Efficiency Index</span>
                        <span className="font-bold text-white">{insights.learningEfficiency}/100</span>
                      </div>
                      <ProgressBar progress={insights.learningEfficiency} color="bg-indigo-500" containerClass="bg-neutral-950 h-2 rounded-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-neutral-400">Weekly Consistency Index</span>
                        <span className="font-bold text-white">{insights.studyConsistency}/100</span>
                      </div>
                      <ProgressBar progress={insights.studyConsistency} color="bg-emerald-500" containerClass="bg-neutral-950 h-2 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Report Sections */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                  <h4 className="text-xs font-bold uppercase text-neutral-400">Strategic Guidance</h4>
                  <div className="space-y-4">
                    {insights.weeklyReport.sections.map((sect, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkle className="w-3.5 h-3.5 text-indigo-400" /> {sect.title}
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">{sect.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 bg-neutral-900/40">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-neutral-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="font-bold text-white">Unlock Career Mastery Reports</h4>
                <p className="text-xs text-neutral-400">Access deep-dive reports showing your skill strength distributions, efficiency graphs, and consistency trends.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
                Upgrade to Professional
              </Button>
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  );
}
