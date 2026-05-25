import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Terminal, Play, Lightbulb, Briefcase } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';
import { DailyCodingService, type DailyCodingProblem } from '../services/dailyCodingService';
import { ChallengeService } from '../services/challengeService';
import { getWeekKey, getWeeklyProblems } from '../services/weeklyCodingService';
import { cn } from '../utils/cn';
import type { ChallengeRecord } from '../types';

export default function StarMPage() {
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily');
  const [dailyProblems, setDailyProblems] = useState<DailyCodingProblem[]>([]);
  const [weeklyProblems, setWeeklyProblems] = useState<ChallengeRecord[]>([]);
  const [weeklyCompleted, setWeeklyCompleted] = useState<Record<string, boolean>>({});
  const [activeDaily, setActiveDaily] = useState<DailyCodingProblem | null>(null);
  const [activeWeekly, setActiveWeekly] = useState<ChallengeRecord | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error' | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const p = await ProfileService.getProfile(user.id);
      if (!p) return;
      const list = await DailyCodingService.ensureDailyProblems(user.id, p);
      setDailyProblems(list);
      setWeeklyProblems(getWeeklyProblems(p));
      setWeeklyCompleted(await ChallengeService.getCompletionMap(user.id));
    })();
  }, []);

  useEffect(() => {
    setActiveDaily(null);
    setActiveWeekly(null);
    setCode('');
    setMessage(null);
    setMessageTone(null);
    setShowHints(false);
  }, [mode]);

  const openDailyProblem = (prob: DailyCodingProblem) => {
    if (prob.completed && prob.passed) return;
    setActiveDaily(prob);
    setCode(prob.starterCode);
    setMessage(null);
    setMessageTone(null);
    setShowHints(false);
  };

  const openWeeklyProblem = (prob: ChallengeRecord) => {
    if (weeklyCompleted[prob.id]) return;
    setActiveWeekly(prob);
    setCode(prob.starterCode || '');
    setMessage(null);
    setMessageTone(null);
    setShowHints(false);
  };

  const submit = async () => {
    if (mode === 'daily' && !activeDaily) return;
    if (mode === 'weekly' && !activeWeekly) return;
    const uid = userId || (await supabase.auth.getUser()).data.user?.id || null;
    if (!uid) return;
    setVerifying(true);
    if (mode === 'daily' && activeDaily) {
      const result = await DailyCodingService.submit(uid, activeDaily.id, code, activeDaily);
      setMessage(result.message);
      setMessageTone(result.passed ? 'success' : 'error');
      if (result.passed) {
        setDailyProblems((prev) => prev.map((p) => (p.id === activeDaily.id ? { ...p, completed: true, passed: true } : p)));
        setActiveDaily(null);
      }
    }

    if (mode === 'weekly' && activeWeekly) {
      const result = await ChallengeService.submit(uid, activeWeekly.id, code);
      const xpText = result.passed
        ? result.awarded
          ? `+${activeWeekly.xpReward} XP`
          : '+0 XP (already awarded)'
        : 'Tests failed — check logic and try again.';
      setMessage(result.passed ? `All tests passed! ${xpText}` : xpText);
      setMessageTone(result.passed ? 'success' : 'error');
      if (result.passed) {
        setWeeklyCompleted((prev) => ({ ...prev, [activeWeekly.id]: true }));
        setActiveWeekly(null);
      }
    }
    setVerifying(false);
  };

  const dailyDone = dailyProblems.filter((p) => p.passed).length;
  const weeklyDone = weeklyProblems.filter((p) => weeklyCompleted[p.id]).length;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold">StarM Daily Code</h1>
              <p className="text-neutral-400 mt-1">3 real-world coding problems per day — unique to your skills.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <Button size="sm" variant={mode === 'daily' ? 'primary' : 'secondary'} onClick={() => setMode('daily')}>
              Daily
            </Button>
            <Button size="sm" variant={mode === 'weekly' ? 'primary' : 'secondary'} onClick={() => setMode('weekly')}>
              Weekly
            </Button>
            {mode === 'daily' ? (
              <Badge color="indigo">{dailyDone} / 3 solved today</Badge>
            ) : (
              <Badge color="indigo">{weeklyDone} / {weeklyProblems.length} solved this week</Badge>
            )}
            <Badge color="neutral">{mode === 'daily' ? new Date().toLocaleDateString() : `Week of ${getWeekKey()}`}</Badge>
          </div>
        </header>

        {mode === 'daily' && !activeDaily && (
          <div className="space-y-4">
            {dailyProblems.map((p) => (
              <Card
                key={p.id}
                className={cn('p-6 cursor-pointer border-white/5 hover:border-indigo-500/40 transition-all', p.passed && 'border-emerald-500/30 opacity-80')}
                onClick={() => openDailyProblem(p)}
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge color="indigo">{p.skillName}</Badge>
                      <Badge color="amber">{p.difficulty}</Badge>
                      {p.passed && <Badge color="emerald">Solved</Badge>}
                    </div>
                    <h3 className="font-bold text-xl text-white mb-2">{p.title}</h3>
                    <p className="text-sm text-neutral-400 flex items-start gap-2">
                      <Briefcase className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                      {p.scenario}
                    </p>
                  </div>
                  <div className="text-indigo-400 font-bold shrink-0">+{p.xpReward} XP</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {mode === 'weekly' && !activeWeekly && (
          <div className="space-y-4">
            {weeklyProblems.map((p) => (
              <Card
                key={p.id}
                className={cn('p-6 cursor-pointer border-white/5 hover:border-indigo-500/40 transition-all', weeklyCompleted[p.id] && 'border-emerald-500/30 opacity-80')}
                onClick={() => openWeeklyProblem(p)}
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge color="indigo">{p.type}</Badge>
                      <Badge color={p.difficulty === 'Easy' ? 'emerald' : p.difficulty === 'Medium' ? 'amber' : 'rose'}>
                        {p.difficulty}
                      </Badge>
                      {weeklyCompleted[p.id] && <Badge color="emerald">Solved</Badge>}
                    </div>
                    <h3 className="font-bold text-xl text-white mb-2">{p.title}</h3>
                    <p className="text-sm text-neutral-400">{p.description}</p>
                  </div>
                  <div className="text-indigo-400 font-bold shrink-0">+{p.xpReward} XP</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {mode === 'daily' && activeDaily && (
          <Card className="p-0 border-indigo-500/30 overflow-hidden">
            <div className="p-6 border-b border-white/5 space-y-2">
              <Badge color="indigo">{activeDaily.skillName}</Badge>
              <h2 className="text-2xl font-bold">{activeDaily.title}</h2>
              <p className="text-sm text-amber-200/80">{activeDaily.scenario}</p>
              <p className="text-neutral-300 whitespace-pre-line">{activeDaily.description}</p>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-[#0a0a0a] text-emerald-100 border-0 outline-none resize-y"
              spellCheck={false}
            />
            <div className="p-4 border-t border-white/5 flex flex-wrap gap-3">
              <Button onClick={submit} disabled={verifying} icon={verifying ? <Terminal className="animate-pulse w-4 h-4" /> : <Play className="w-4 h-4" />}>
                {verifying ? 'Running tests…' : 'Run tests & submit'}
              </Button>
              <Button variant="ghost" onClick={() => setShowHints(!showHints)} icon={<Lightbulb className="w-4 h-4" />}>Hints</Button>
              <Button variant="secondary" onClick={() => setActiveDaily(null)}>Back to list</Button>
            </div>
            {showHints && (
              <ul className="px-6 pb-4 text-sm text-indigo-300 space-y-1">
                {activeDaily.hints.map((h) => <li key={h}>• {h}</li>)}
              </ul>
            )}
          </Card>
        )}

        {mode === 'weekly' && activeWeekly && (
          <Card className="p-0 border-indigo-500/30 overflow-hidden">
            <div className="p-6 border-b border-white/5 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge color="indigo">{activeWeekly.type}</Badge>
                <Badge color={activeWeekly.difficulty === 'Easy' ? 'emerald' : activeWeekly.difficulty === 'Medium' ? 'amber' : 'rose'}>
                  {activeWeekly.difficulty}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold">{activeWeekly.title}</h2>
              <p className="text-neutral-300 whitespace-pre-line">{activeWeekly.description}</p>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-[#0a0a0a] text-emerald-100 border-0 outline-none resize-y"
              spellCheck={false}
            />
            <div className="p-4 border-t border-white/5 flex flex-wrap gap-3">
              <Button onClick={submit} disabled={verifying} icon={verifying ? <Terminal className="animate-pulse w-4 h-4" /> : <Play className="w-4 h-4" />}>
                {verifying ? 'Running tests…' : 'Run tests & submit'}
              </Button>
              <Button variant="secondary" onClick={() => setActiveWeekly(null)}>Back to list</Button>
            </div>
          </Card>
        )}

        {message && (
          <p className={cn('text-center font-bold', messageTone === 'success' ? 'text-emerald-400' : 'text-rose-400')}>
            {message}
          </p>
        )}
      </div>
    </AppShell>
  );
}
