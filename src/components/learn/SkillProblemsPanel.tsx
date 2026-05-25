import React, { useState } from 'react';
import { Code2, Lightbulb, Play, CheckCircle2, Trophy } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getProblemsForSkill, runSkillProblemTest, type SkillConceptProblem } from '../../content/skillProblems';
import { XPService } from '../../services/xpService';
import { cn } from '../../utils/cn';

interface SkillProblemsPanelProps {
  skillName: string;
  userId: string;
}

export function SkillProblemsPanel({ skillName, userId }: SkillProblemsPanelProps) {
  const problems = getProblemsForSkill(skillName);
  const [active, setActive] = useState<SkillConceptProblem | null>(problems[0] || null);
  const [code, setCode] = useState(problems[0]?.starterCode || '');
  const [result, setResult] = useState<'idle' | 'pass' | 'fail'>('idle');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState(false);

  const select = (p: SkillConceptProblem) => {
    setActive(p);
    setCode(p.starterCode);
    setResult('idle');
    setShowHints(false);
  };

  const submit = async () => {
    if (!active) return;
    const passed = runSkillProblemTest(code, active);
    setResult(passed ? 'pass' : 'fail');
    if (passed) {
      const key = `skill-problem-${active.id}`;
      const { awarded } = await XPService.awardOnce(userId, 'practice', key, active.xpReward);
      if (awarded) setCompleted((c) => ({ ...c, [active.id]: true }));
    }
  };

  const byDiff = (d: SkillConceptProblem['difficulty']) => problems.filter((p) => p.difficulty === d);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-80 space-y-4 shrink-0">
        {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
          <div key={diff}>
            <p className="text-xs font-bold text-neutral-500 uppercase mb-2">{diff} ({byDiff(diff).length})</p>
            <div className="space-y-2">
              {byDiff(diff).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => select(p)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border text-sm transition-all',
                    active?.id === p.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-neutral-900/50 hover:border-white/20'
                  )}
                >
                  <div className="font-bold text-white line-clamp-1">{p.title}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge color={diff === 'Easy' ? 'emerald' : diff === 'Medium' ? 'amber' : 'rose'} className="text-[10px]">
                      {diff}
                    </Badge>
                    {completed[p.id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {active && (
        <div className="flex-1 space-y-4 min-w-0">
          <Card className="p-5 border-amber-500/20 bg-amber-500/5">
            <Badge color="amber" className="mb-2">Real-world ticket</Badge>
            <p className="text-sm text-amber-100/90">{active.scenario}</p>
          </Card>
          <p className="text-neutral-300 text-sm leading-relaxed">{active.description}</p>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-900 text-xs font-bold text-neutral-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Solution
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-48 p-4 font-mono text-sm bg-[#0a0a0a] text-emerald-100/90 outline-none resize-y"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={submit} icon={<Play className="w-4 h-4" />}>Run tests</Button>
            <Button variant="ghost" onClick={() => setShowHints(!showHints)} icon={<Lightbulb className="w-4 h-4" />}>
              Hints
            </Button>
            <span className="flex items-center gap-1 text-indigo-400 text-sm font-bold">
              <Trophy className="w-4 h-4" /> {active.xpReward} XP
            </span>
          </div>
          {showHints && (
            <ul className="text-sm text-indigo-300 space-y-1">
              {active.hints.map((h) => (
                <li key={h}>• {h}</li>
              ))}
            </ul>
          )}
          {result === 'pass' && <p className="text-emerald-400 font-bold">All tests passed!</p>}
          {result === 'fail' && <p className="text-rose-400 font-bold">Tests failed — adjust and retry.</p>}
        </div>
      )}
    </div>
  );
}
