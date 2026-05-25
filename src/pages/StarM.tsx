import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Terminal, Play, Lightbulb, Briefcase } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';
import { DailyCodingService, type DailyCodingProblem } from '../services/dailyCodingService';
import { cn } from '../utils/cn';

export default function StarMPage() {
  const [problems, setProblems] = useState<DailyCodingProblem[]>([]);
  const [active, setActive] = useState<DailyCodingProblem | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const p = await ProfileService.getProfile(user.id);
      if (!p) return;
      const list = await DailyCodingService.ensureDailyProblems(user.id, p);
      setProblems(list);
    })();
  }, []);

  const openProblem = (prob: DailyCodingProblem) => {
    if (prob.completed && prob.passed) return;
    setActive(prob);
    setCode(prob.starterCode);
    setMessage(null);
    setShowHints(false);
  };

  const submit = async () => {
    if (!active) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setVerifying(true);
    const result = await DailyCodingService.submit(user.id, active.id, code, active);
    setMessage(result.passed ? `All tests passed! +${result.awarded ? active.xpReward : 0} XP` : 'Tests failed — check logic and try again.');
    if (result.passed) {
      setProblems((prev) => prev.map((p) => (p.id === active.id ? { ...p, completed: true, passed: true } : p)));
      setActive(null);
    }
    setVerifying(false);
  };

  const done = problems.filter((p) => p.passed).length;

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
          <div className="mt-4 flex gap-2">
            <Badge color="indigo">{done} / 3 solved today</Badge>
            <Badge color="neutral">{new Date().toLocaleDateString()}</Badge>
          </div>
        </header>

        {!active ? (
          <div className="space-y-4">
            {problems.map((p) => (
              <Card
                key={p.id}
                className={cn('p-6 cursor-pointer border-white/5 hover:border-indigo-500/40 transition-all', p.passed && 'border-emerald-500/30 opacity-80')}
                onClick={() => openProblem(p)}
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
        ) : (
          <Card className="p-0 border-indigo-500/30 overflow-hidden">
            <div className="p-6 border-b border-white/5 space-y-2">
              <Badge color="indigo">{active.skillName}</Badge>
              <h2 className="text-2xl font-bold">{active.title}</h2>
              <p className="text-sm text-amber-200/80">{active.scenario}</p>
              <p className="text-neutral-300 whitespace-pre-line">{active.description}</p>
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
              <Button variant="secondary" onClick={() => setActive(null)}>Back to list</Button>
            </div>
            {showHints && (
              <ul className="px-6 pb-4 text-sm text-indigo-300 space-y-1">
                {active.hints.map((h) => <li key={h}>• {h}</li>)}
              </ul>
            )}
          </Card>
        )}

        {message && <p className={cn('text-center font-bold', message.includes('passed') ? 'text-emerald-400' : 'text-rose-400')}>{message}</p>}
      </div>
    </AppShell>
  );
}
