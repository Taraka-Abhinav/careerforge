import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, BrainCircuit, Flame, Check, GitBranch, Video, Play, FileText, Activity,
} from 'lucide-react';
import { UserProfile, UserProgress, INITIAL_BASELINE_PROFILE, SkillItem } from '../types';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';
import { ProgressService } from '../services/progressService';
import { RoadmapEngine } from '../services/roadmapEngine';
import { MissionService } from '../services/missionService';
import { GoalService } from '../services/goalService';
import { ChallengeService } from '../services/challengeService';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { Mission, WeeklyGoal } from '../types';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_BASELINE_PROFILE);
  const [progress, setProgress] = useState<UserProgress>({ xp: 0, level: 1, streakDays: 0, lastActiveDate: '' });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [focus, setFocus] = useState<{ skillSlug: string; skillName: string; phase: string } | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const loadedProfile = await ProfileService.getProfile(user.id);
      if (!loadedProfile || !loadedProfile.isComplete) {
        navigate('/onboarding');
        return;
      }

      const [loadedProgress, loadedMissions, goal, focusSkill] = await Promise.all([
        ProgressService.getProgress(user.id),
        MissionService.getMissions(user.id),
        GoalService.generateWeeklyGoal(user.id),
        RoadmapEngine.getCurrentFocus(user.id),
      ]);
      await ChallengeService.assignDailyChallenges(user.id);

      setProfile(loadedProfile);
      setProgress(loadedProgress);
      setMissions(loadedMissions);
      setWeeklyGoal(goal);
      setFocus(focusSkill);
      setSkills([...loadedProfile.skills.known, ...loadedProfile.skills.learning]);
    } catch (e) {
      console.error('Dashboard Load Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMissionClick = (mission: Mission) => {
    if (mission.isCompleted) return;
    if (mission.type === 'challenge') {
      navigate('/challenges');
    } else {
      const slug = focus?.skillSlug || 'python';
      navigate(`/learn/${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-neutral-400 font-bold animate-pulse">Computing Intelligence Matrix...</p>
      </div>
    );
  }

  const goalProgress = weeklyGoal ? Math.round((weeklyGoal.currentCount / weeklyGoal.targetCount) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {profile.basic.name.split(' ')[0] || 'Learner'}
            </h1>
            <p className="text-neutral-400 flex items-center gap-2 flex-wrap">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              Training for{' '}
              <span className="text-white font-bold px-2 py-1 rounded bg-white/5">{profile.goals.career}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-neutral-900/50 border border-white/5 py-2.5 px-4 rounded-xl shadow-inner">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Flame className="w-5 h-5" /> {progress.streakDays} Day Streak
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.05)] relative overflow-hidden group p-8">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-40 h-40 text-indigo-500" />
              </div>
              <div className="relative z-10 space-y-5">
                <Badge color="indigo" className="uppercase tracking-widest text-[10px] font-black bg-indigo-500 text-white rounded-md px-2 py-1">
                  Current Focus
                </Badge>
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">
                    {focus?.skillName || 'Continue your roadmap'}
                  </h2>
                  <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                    {focus?.phase
                      ? `You are in ${focus.phase}. Complete modules to unlock the next phase.`
                      : 'Open your roadmap to see personalized skills and projects.'}
                  </p>
                </div>
                <div className="pt-6 flex flex-wrap gap-4">
                  <Button
                    icon={<Play className="w-4 h-4 shrink-0" />}
                    className="shadow-[0_0_20px_rgba(79,70,229,0.4)] px-6 min-w-0"
                    onClick={() => navigate(focus ? `/learn/${focus.skillSlug}` : '/roadmap')}
                  >
                    Resume Training
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<FileText className="w-4 h-4 shrink-0" />}
                    className="text-neutral-300 hover:text-white bg-white/5 border-transparent min-w-0"
                    onClick={() => navigate('/roadmap')}
                  >
                    View Roadmap
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-200">
                <Check className="w-5 h-5 text-emerald-400" /> Daily Intelligence Missions
              </h3>
              <div className="space-y-3">
                {missions.map((mission) => (
                  <Card
                    key={mission.id}
                    padding="p-4"
                    className={`flex justify-between items-center bg-neutral-900 border-white/5 transition-all ${
                      mission.isCompleted ? 'opacity-50' : 'hover:border-emerald-500/30 cursor-pointer'
                    }`}
                    onClick={() => handleMissionClick(mission)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center border border-white/5 shrink-0">
                        {mission.type === 'challenge' ? (
                          <GitBranch className="w-5 h-5 text-neutral-400" />
                        ) : (
                          <Video className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm mb-0.5 truncate">{mission.title}</div>
                        <div className="text-xs text-neutral-500 font-medium">
                          {mission.isCompleted ? 'Completed' : 'Tap to start'}
                        </div>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
                      +{mission.xpReward} XP
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {weeklyGoal && (
              <Card className="border-white/5 p-6 bg-gradient-to-b from-neutral-900 to-neutral-900/50 relative overflow-hidden">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" /> Weekly Logic Constraint
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-3 gap-2">
                      <span className="text-neutral-300 font-semibold">{weeklyGoal.title}</span>
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded shrink-0">
                        {weeklyGoal.currentCount} / {weeklyGoal.targetCount}
                      </span>
                    </div>
                    <ProgressBar progress={goalProgress} color="bg-indigo-500" containerClass="bg-neutral-950 h-3 rounded-full" />
                  </div>
                </div>
              </Card>
            )}

            <Card className="border-white/5 p-6 shadow-xl">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Skill Matrix
              </h3>
              <div className="space-y-4">
                {skills.length === 0 ? (
                  <p className="text-sm text-neutral-500">No skills tracked yet.</p>
                ) : (
                  skills.slice(0, 6).map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400 font-semibold">{s.name}</span>
                      <Badge
                        color={
                          s.status === 'Mastered' ? 'emerald' : s.status === 'Learning' ? 'amber' : 'neutral'
                        }
                      >
                        {s.status || (s.level ? 'Known' : 'Learning')}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5">
                <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-400 hover:bg-indigo-500/10" onClick={() => navigate('/roadmap')}>
                  View Full Taxonomy
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
