import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, CheckCircle2, Sparkles, Code2, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { ModuleRenderer } from '../components/learn/ModuleRenderer';
import { SkillProblemsPanel } from '../components/learn/SkillProblemsPanel';
import { ModuleService } from '../services/moduleService';
import { QuizService } from '../services/quizService';
import { GoalService } from '../services/goalService';
import { ProfileService } from '../services/profileService';
import { NotesService } from '../services/notesService';
import { NotesViewer } from '../components/starm/NotesViewer';
import { supabase } from '../supabase/client';
import type { LearningModule, UserProfile } from '../types';
import type { NoteSection } from '../services/starmService';
import { cn } from '../utils/cn';

export default function LearnFocus() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [skillData, setSkillData] = useState<Awaited<ReturnType<typeof ModuleService.ensureAndGetSkill>>>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [noteSections, setNoteSections] = useState<NoteSection[]>([]);
  const [view, setView] = useState<'modules' | 'notes' | 'problems'>('modules');
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      setSkillData(null);
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      setUserId(uid || null);
      if (!uid || !skillId) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      const p = await ProfileService.getProfile(uid);
      setProfile(p);
      const skill = await ModuleService.ensureAndGetSkill(uid, skillId);
      if (!skill) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setSkillData(skill);
      if (p) setNoteSections(await NotesService.getOrGenerate(uid, skill.skillName, p));
      const first = skill.modules.find((m) => m.status !== 'locked' && m.status !== 'completed');
      setActiveModuleId(first?.id || skill.modules[0]?.id || null);
      setLoading(false);
    })();
  }, [skillId]);

  const activeModule = skillData?.modules.find((m) => m.id === activeModuleId);

  const refresh = async () => {
    if (!userId || !skillId) return;
    setSkillData(await ModuleService.ensureAndGetSkill(userId, skillId));
  };

  const handleCompleteModule = async (mod: LearningModule) => {
    if (!userId || mod.status === 'completed' || mod.status === 'locked') return;
    if (mod.type === 'quiz') return;
    setCompleting(true);
    const sourceType = mod.type === 'lesson' ? 'lesson' : mod.type === 'assessment' ? 'assessment' : mod.type === 'project' ? 'project' : mod.type === 'practice' ? 'practice' : 'module';
    await ModuleService.completeModule(userId, mod.id, mod.xpReward, sourceType);
    await ModuleService.checkAndMasterSkill(userId, mod.skillId);
    const goal = await GoalService.generateWeeklyGoal(userId);
    if (goal?.status === 'active') await GoalService.incrementProgress(userId, goal.id);
    await refresh();
    setCompleting(false);
  };

  const handleQuizSubmit = async (answers: Record<string, number>) => {
    if (!userId || !activeModule) return;
    const content = activeModule.content as { questions?: import('../types').QuizQuestion[]; passThreshold?: number };
    const result = await QuizService.submitAttempt(userId, activeModule.id, content.questions || [], answers, content.passThreshold || 70, activeModule.xpReward);
    setQuizResult(`Score: ${result.score}% — ${result.passed ? `+${result.xpEarned} XP` : 'Below pass threshold'}`);
    if (result.passed) {
      await ModuleService.checkAndMasterSkill(userId, activeModule.skillId);
      const goal = await GoalService.generateWeeklyGoal(userId);
      if (goal?.status === 'active') await GoalService.incrementProgress(userId, goal.id);
    }
    await refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Loading training for {skillId?.replace(/-/g, ' ')}…</p>
      </div>
    );
  }

  if (notFound || !skillData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 gap-4">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <h1 className="text-2xl font-bold">Skill not ready yet</h1>
        <p className="text-neutral-400 text-center max-w-md">
          We could not load this topic. Try refreshing your roadmap or pick another skill.
        </p>
        <Button onClick={() => navigate('/roadmap')}>Back to Roadmap</Button>
      </div>
    );
  }

  const totalXp = skillData.modules.reduce((s, m) => s + (m.status === 'completed' ? m.xpReward : 0), 0);
  const maxXp = skillData.modules.reduce((s, m) => s + m.xpReward, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="border-b border-white/5 bg-neutral-900/50 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <button type="button" onClick={() => navigate('/roadmap')} className="flex items-center gap-2 text-neutral-400 hover:text-white shrink-0">
            <ArrowLeft className="w-5 h-5" /> Back to Roadmap
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              {[
                { id: 'modules' as const, label: 'Training', icon: BrainCircuit },
                { id: 'problems' as const, label: 'Problems', icon: Code2 },
                { id: 'notes' as const, label: 'StarM Notes', icon: Sparkles },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={cn('px-3 py-2 text-xs font-bold flex items-center gap-1', view === tab.id ? 'bg-indigo-500 text-white' : 'text-neutral-400')}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>
            <span className="font-extrabold hidden md:inline">{skillData.skillName}</span>
          </div>
        </div>
      </header>

      {view === 'notes' && profile && userId && (
        <div className="max-w-4xl mx-auto p-6 w-full">
          <NotesViewer sections={noteSections} skillName={skillData.skillName} careerGoal={profile.goals.career} userId={userId} />
        </div>
      )}

      {view === 'problems' && userId && (
        <div className="max-w-6xl mx-auto p-6 w-full">
          <h2 className="text-2xl font-extrabold mb-2">Concept Problems</h2>
          <p className="text-neutral-400 text-sm mb-6">9 challenges per skill — Easy (rigorous), Medium, and Hard. Real tickets, real tests.</p>
          <SkillProblemsPanel skillName={skillData.skillName} userId={userId} />
        </div>
      )}

      {view === 'modules' && (
        <div className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto p-6 gap-8 min-w-0">
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Training pipeline</h3>
            <div className="space-y-2">
              {skillData.modules.map((mod, i) => (
                <button
                  key={mod.id}
                  type="button"
                  disabled={mod.status === 'locked'}
                  onClick={() => mod.status !== 'locked' && setActiveModuleId(mod.id)}
                  className={cn(
                    'w-full p-4 rounded-2xl border text-left transition-all',
                    activeModuleId === mod.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-neutral-900/50 border-white/5',
                    mod.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'
                  )}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-bold">{i + 1}. {mod.title}</span>
                    {mod.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                  <Badge color="neutral" className="mt-2 text-[10px]">{mod.type}</Badge>
                </button>
              ))}
            </div>
            <Card padding="p-4" className="border-indigo-500/20 bg-indigo-500/5">
              <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Progress</p>
              <p className="text-xl font-black">{totalXp} / {maxXp} XP</p>
            </Card>
          </aside>

          <main className="flex-1 min-w-0">
            {activeModule ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">{activeModule.title}</h1>
                  <Badge color="indigo">{activeModule.type}</Badge>
                </div>
                {quizResult && activeModule.type === 'quiz' && <p className="text-emerald-400 font-bold">{quizResult}</p>}
                <ModuleRenderer
                  module={activeModule}
                  skillName={skillData.skillName}
                  onComplete={() => handleCompleteModule(activeModule)}
                  completing={completing}
                  quizSlot={
                    activeModule.type === 'quiz' ? (
                      <QuizRunner
                        questions={(activeModule.content as { questions?: import('../types').QuizQuestion[] }).questions || []}
                        passThreshold={(activeModule.content as { passThreshold?: number }).passThreshold || 70}
                        onSubmit={handleQuizSubmit}
                        disabled={activeModule.status === 'completed'}
                      />
                    ) : undefined
                  }
                />
                {activeModule.status === 'completed' && (
                  <p className="text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Completed — XP awarded
                  </p>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center text-neutral-400">Select a module from the left to start training.</Card>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
