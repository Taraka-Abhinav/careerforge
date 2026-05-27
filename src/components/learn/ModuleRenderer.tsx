import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Code2, ExternalLink, Lightbulb, ListChecks } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { LearningModule } from '../../types';
import type { RichLessonContent, RichPracticeContent, RichProjectContent } from '../../content/skillContent';
import { EngagementService } from '../../services/engagementService';
import { LearningDepthService } from '../../services/learningDepthService';

interface ModuleRendererProps {
  module: LearningModule;
  skillName: string;
  userId?: string | null;
  onComplete: () => void;
  completing: boolean;
  quizSlot?: React.ReactNode;
}

function xpLabel(module: LearningModule): string {
  return module.xpReward > 0 ? ` (+${module.xpReward} XP)` : '';
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

function ChecklistCard({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <Card className="p-5 border-white/5">
      <h4 className="font-bold text-sm text-neutral-400 mb-3 flex items-center gap-2">
        <ListChecks className="w-4 h-4" /> {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-neutral-300 flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PracticeModule({
  practice,
  module,
  onComplete,
  completing,
  userId,
  checkpointMap,
  onCheckpointToggle,
}: {
  practice: RichPracticeContent;
  module: LearningModule;
  onComplete: () => void;
  completing: boolean;
  userId?: string | null;
  checkpointMap: Record<string, boolean>;
  onCheckpointToggle: (checkpointKey: string, next: boolean) => void;
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
      {practice.checkpoints?.length > 0 && (
        <Card className="p-5 border-white/5">
          <h4 className="font-bold text-sm text-neutral-400 mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4" /> Checkpoints
          </h4>
          <div className="space-y-3">
            {practice.checkpoints.map((item, index) => {
              const key = `practice-${index}`;
              const done = checkpointMap[key];
              return (
                <div key={item} className="flex items-start justify-between gap-3">
                  <div className="text-sm text-neutral-300 flex gap-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-400' : 'text-neutral-600'}`} />
                    {item}
                  </div>
                  <Button
                    size="sm"
                    variant={done ? 'secondary' : 'ghost'}
                    onClick={() => onCheckpointToggle(key, !done)}
                    disabled={!userId}
                  >
                    {done ? 'Completed' : 'Mark done'}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      <Button variant="ghost" onClick={() => setShowHints(!showHints)} icon={<Lightbulb className="w-4 h-4" />}>
        {showHints ? 'Hide hints' : 'Show hints'}
      </Button>
      {showHints && (
        <ul className="space-y-2 text-sm text-indigo-300">
          {(practice.hints || []).map((h) => <li key={h}>- {h}</li>)}
        </ul>
      )}
      {module.status !== 'completed' && (
        <Button size="lg" className="w-full" onClick={onComplete} disabled={completing}>
          Mark practice complete{xpLabel(module)}
        </Button>
      )}
    </div>
  );
}

export function ModuleRenderer({ module, skillName, userId, onComplete, completing, quizSlot }: ModuleRendererProps) {
  const c = module.content as Record<string, unknown>;
  const [checkpointMap, setCheckpointMap] = useState<Record<string, boolean>>({});
  const [projectUrl, setProjectUrl] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectSaved, setProjectSaved] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCheckpointMap({});
      return;
    }
    LearningDepthService.getCheckpointMap(userId, module.id).then(setCheckpointMap);
  }, [userId, module.id]);

  useEffect(() => {
    if (!userId || (module.type !== 'project' && module.type !== 'assessment')) {
      setProjectUrl('');
      setProjectNotes('');
      setProjectSaved(false);
      return;
    }
    let isMounted = true;
    LearningDepthService.getProjectSubmission(userId, module.id).then((submission) => {
      if (!isMounted) return;
      setProjectUrl(submission?.projectUrl || '');
      setProjectNotes(submission?.notes || '');
      setProjectSaved(Boolean(submission?.projectUrl || submission?.notes));
    });
    return () => {
      isMounted = false;
    };
  }, [userId, module.id, module.type]);

  const handleCheckpointToggle = async (checkpointKey: string, next: boolean) => {
    if (!userId) return;
    const updated = await LearningDepthService.setCheckpoint(userId, module.id, checkpointKey, next);
    setCheckpointMap(updated);
  };

  const handleProjectSave = async () => {
    if (!userId) return;
    setProjectSaving(true);
    const saved = await LearningDepthService.saveProjectSubmission(userId, module.id, {
      projectUrl,
      notes: projectNotes,
    });
    setProjectUrl(saved.projectUrl || '');
    setProjectNotes(saved.notes || '');
    setProjectSaved(true);
    setProjectSaving(false);
  };

  if (module.type === 'lesson') {
    const lesson = c as unknown as RichLessonContent;
    const sections = lesson.theorySections || [];
    return (
      <div className="space-y-8">
        <p className="text-lg text-neutral-300 leading-relaxed">{lesson.overview}</p>
        <ChecklistCard title="Learning objectives" items={lesson.learningObjectives} />
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
          <h3 className="font-bold text-white mb-4">Recommended resources</h3>
          <div className="grid gap-3">
            {(lesson.resources || []).map((r) => (
              <Card key={r.title} padding="p-4" className="flex justify-between items-center border-white/5">
                <div>
                  <div className="font-semibold text-white text-sm">{r.title}</div>
                  <Badge color="neutral" className="mt-1">{r.type}</Badge>
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-white"
                    onClick={() => {
                      if (!userId) return;
                      void EngagementService.trackEvent(userId, 'resource_opened', {
                        moduleId: module.id,
                        skillName,
                        resourceTitle: r.title,
                        resourceType: r.type,
                        url: r.url,
                      });
                    }}
                  >
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

        {lesson.checkpoints?.length > 0 && (
          <Card className="p-5 border-white/5">
            <h3 className="font-bold text-white mb-3">Checkpoints</h3>
            <div className="space-y-3">
              {lesson.checkpoints.map((checkpoint, index) => {
                const key = `lesson-${index}`;
                const done = checkpointMap[key];
                return (
                  <div key={checkpoint.title} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-neutral-200">{checkpoint.title}</div>
                      <div className="text-sm text-neutral-400">{checkpoint.prompt}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={done ? 'secondary' : 'ghost'}
                      onClick={() => handleCheckpointToggle(key, !done)}
                      disabled={!userId}
                    >
                      {done ? 'Completed' : 'Mark done'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {module.status !== 'completed' && module.status !== 'locked' && (
          <Button size="lg" className="w-full" onClick={onComplete} disabled={completing}>
            Complete lesson{xpLabel(module)}
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
        userId={userId}
        checkpointMap={checkpointMap}
        onCheckpointToggle={handleCheckpointToggle}
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
            {(proj.requirements || []).map((r) => <li key={r} className="flex gap-2"><span className="text-indigo-400">-</span>{r}</li>)}
          </ul>
        </Card>
        <Card className="p-5 border-white/5">
          <h4 className="font-bold mb-3">Milestones</h4>
          <ol className="list-decimal list-inside text-sm text-neutral-300 space-y-1">
            {(proj.milestones || []).map((m) => <li key={m}>{m}</li>)}
          </ol>
        </Card>
        <ChecklistCard title="Completion checkpoints" items={proj.checkpoints} />
        {proj.tasks && (
          <Card className="p-5 border-indigo-500/20">
            <h4 className="font-bold mb-3">Assessment tasks</h4>
            <ul className="text-sm text-neutral-300 space-y-2">{proj.tasks.map((t) => <li key={t}>- {t}</li>)}</ul>
          </Card>
        )}
        {userId && (
          <Card className="p-5 border-white/5">
            <h4 className="font-bold mb-3">Project submission</h4>
            <div className="space-y-3">
              <input
                value={projectUrl}
                onChange={(e) => { setProjectUrl(e.target.value); setProjectSaved(false); }}
                placeholder="Project URL or demo link"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              />
              <textarea
                value={projectNotes}
                onChange={(e) => { setProjectNotes(e.target.value); setProjectSaved(false); }}
                placeholder="Notes on decisions, trade-offs, or blockers"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm h-24 resize-y"
              />
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleProjectSave}
                  disabled={projectSaving || (!projectUrl && !projectNotes)}
                >
                  {projectSaving ? 'Saving…' : 'Save submission'}
                </Button>
                {projectSaved && <span className="text-xs text-emerald-400 font-semibold">Saved</span>}
              </div>
            </div>
          </Card>
        )}
        {module.status !== 'completed' && (
          <Button size="lg" className="w-full" onClick={onComplete} disabled={completing}>
            Submit {module.type}{xpLabel(module)}
          </Button>
        )}
      </div>
    );
  }

  return <p className="text-neutral-400">Content loading for {skillName}...</p>;
}
