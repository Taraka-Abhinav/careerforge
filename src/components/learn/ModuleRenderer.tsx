import React, { useState } from 'react';
import { Code2, BookOpen, ListChecks, Lightbulb, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { LearningModule } from '../../types';
import type { RichLessonContent, RichPracticeContent, RichProjectContent } from '../../content/skillContent';

interface ModuleRendererProps {
  module: LearningModule;
  skillName: string;
  onComplete: () => void;
  completing: boolean;
  quizSlot?: React.ReactNode;
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
      {title && <div className="px-4 py-2 bg-neutral-900 text-xs font-bold text-neutral-400 border-b border-white/5">{title}</div>}
      <pre className="p-4 text-sm text-emerald-100/90 overflow-x-auto font-mono leading-relaxed">{code}</pre>
      <div className="px-4 py-2 border-t border-white/5 flex justify-end">
        <button
          type="button"
          className="text-xs text-indigo-400 hover:text-white"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
    </div>
  );
}

function PracticeModule({
  practice,
  module,
  onComplete,
  completing,
}: {
  practice: RichPracticeContent;
  module: LearningModule;
  onComplete: () => void;
  completing: boolean;
}) {
  const [showHints, setShowHints] = useState(false);
  return (
    <div className="space-y-6">
      <Card className="p-5 border-amber-500/20 bg-amber-500/5">
        <Badge color="amber" className="mb-2">Real-world scenario</Badge>
        <p className="text-amber-100/90 text-sm">{practice.realWorldContext}</p>
      </Card>
      <div>
        <h3 className="font-bold text-white mb-2">Your task</h3>
        <p className="text-neutral-300 whitespace-pre-line leading-relaxed">{practice.problem}</p>
      </div>
      <CodeBlock code={practice.starterCode || '// Your solution'} title="Starter code" />
        <Card className="p-5 border-white/5">
          <h4 className="font-bold text-sm text-neutral-400 mb-3 flex items-center gap-2"><ListChecks className="w-4 h-4" /> Steps</h4>
          <ol className="space-y-4">
            {(practice.steps || []).map((s, i) => {
              const heading = typeof s === 'string' ? `Step ${i + 1}` : `Step ${i + 1}: ${s.heading}`;
              const body = typeof s === 'string' ? s : s.body;
              return (
                <li key={heading} className="text-sm text-neutral-300">
                  <span className="font-bold text-white block mb-1">{heading}</span>
                  <span className="text-neutral-400 leading-relaxed">{body}</span>
                </li>
              );
            })}
          </ol>
        </Card>
      <Button variant="ghost" onClick={() => setShowHints(!showHints)} icon={<Lightbulb className="w-4 h-4" />}>
        {showHints ? 'Hide hints' : 'Show hints'}
      </Button>
      {showHints && (
        <ul className="space-y-2 text-sm text-indigo-300">
          {(practice.hints || []).map((h) => <li key={h}>• {h}</li>)}
        </ul>
      )}
      {module.status !== 'completed' && (
        <Button size="lg" className="w-full" onClick={onComplete} disabled={completing}>
          Mark practice complete (+{module.xpReward} XP)
        </Button>
      )}
    </div>
  );
}

export function ModuleRenderer({ module, skillName, onComplete, completing, quizSlot }: ModuleRendererProps) {
  const c = module.content as Record<string, unknown>;

  if (module.type === 'lesson') {
    const lesson = c as unknown as RichLessonContent;
    const sections = lesson.theorySections || [];
    return (
      <div className="space-y-8">
        <p className="text-lg text-neutral-300 leading-relaxed">{lesson.overview}</p>
        <p className="text-neutral-400 leading-relaxed">{lesson.theory}</p>

        {sections.map((sec) => (
          <Card key={sec.title} className="p-6 border-white/5">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> {sec.title}
            </h3>
            <p className="text-neutral-300 leading-relaxed">{sec.body}</p>
          </Card>
        ))}

        {(lesson.codeExamples || []).map((ex) => (
          <div key={ex.title} className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2"><Code2 className="w-5 h-5 text-emerald-400" /> {ex.title}</h3>
            <CodeBlock code={ex.code} />
            <p className="text-sm text-neutral-400">{ex.explanation}</p>
          </div>
        ))}

        <div>
          <h3 className="font-bold text-white mb-4">Resources</h3>
          <div className="grid gap-3">
            {(lesson.resources || []).map((r) => (
              <Card key={r.title} padding="p-4" className="flex justify-between items-center border-white/5">
                <div>
                  <div className="font-semibold text-white text-sm">{r.title}</div>
                  <Badge color="neutral" className="mt-1">{r.type}</Badge>
                </div>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-white">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>

        {lesson.keyTakeaways && (
          <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
            <h3 className="font-bold text-emerald-400 mb-3">Key takeaways</h3>
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((k) => (
                <li key={k} className="text-sm text-neutral-300 flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{k}</li>
              ))}
            </ul>
          </Card>
        )}

        {module.status !== 'completed' && module.status !== 'locked' && (
          <Button size="lg" className="w-full" onClick={onComplete} disabled={completing}>
            Complete lesson (+{module.xpReward} XP)
          </Button>
        )}
      </div>
    );
  }

  if (module.type === 'practice') {
    return (
      <PracticeModule
        practice={c as unknown as RichPracticeContent}
        module={module}
        onComplete={onComplete}
        completing={completing}
      />
    );
  }

  if (module.type === 'quiz') {
    return <div className="space-y-6">{quizSlot}</div>;
  }

  if (module.type === 'project' || module.type === 'assessment') {
    const proj = c as unknown as RichProjectContent & { tasks?: string[] };
    return (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">{proj.overview}</p>
        <Card className="p-5 border-white/5">
          <h4 className="font-bold mb-3">Requirements</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            {(proj.requirements || []).map((r) => <li key={r} className="flex gap-2"><span className="text-indigo-400">✓</span>{r}</li>)}
          </ul>
        </Card>
        <Card className="p-5 border-white/5">
          <h4 className="font-bold mb-3">Milestones</h4>
          <ol className="list-decimal list-inside text-sm text-neutral-300 space-y-1">
            {(proj.milestones || []).map((m) => <li key={m}>{m}</li>)}
          </ol>
        </Card>
        {proj.tasks && (
          <Card className="p-5 border-indigo-500/20">
            <h4 className="font-bold mb-3">Assessment tasks</h4>
            <ul className="text-sm text-neutral-300 space-y-2">{proj.tasks.map((t) => <li key={t}>• {t}</li>)}</ul>
          </Card>
        )}
        {module.status !== 'completed' && (
          <Button size="lg" className="w-full" onClick={onComplete} disabled={completing}>
            Submit {module.type} (+{module.xpReward} XP)
          </Button>
        )}
      </div>
    );
  }

  return <p className="text-neutral-400">Content loading for {skillName}…</p>;
}
