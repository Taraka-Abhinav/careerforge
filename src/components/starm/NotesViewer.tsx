import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronRight, Highlighter, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { NoteSection } from '../../services/starmService';
import { StarMCoachPanel } from './StarMCoachPanel';
import { StarMService, type CoachResponse } from '../../services/starmService';
import { SubscriptionService } from '../../services/subscriptionService';
import { RichNoteText } from '../notes/RichNoteText';

interface NotesViewerProps {
  sections: NoteSection[];
  skillName: string;
  careerGoal: string;
  userId: string;
}

export function NotesViewer({ sections, skillName, careerGoal, userId }: NotesViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ overview: true });
  const [revealedCheckpoint, setRevealedCheckpoint] = useState<Record<string, boolean>>({});
  const [selection, setSelection] = useState('');
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [mentorAllowed, setMentorAllowed] = useState(true);
  const navigate = useNavigate();

  const handleMouseUp = useCallback(() => {
    const text = window.getSelection()?.toString().trim();
    if (text && text.length > 3) setSelection(text);
  }, []);

  useEffect(() => {
    let isMounted = true;
    SubscriptionService.canUseFeature(userId, 'ai_mentor').then((allowed) => {
      if (isMounted) setMentorAllowed(allowed);
    });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const askStarM = async () => {
    if (!selection) return;
    if (!mentorAllowed) return;
    setShowCoach(true);
    setCoachLoading(true);
    setCoach(null);
    await SubscriptionService.trackFeatureUsage(userId, 'ai_mentor');
    const res = await StarMService.explainHighlight(userId, {
      selection,
      skillName,
      careerGoal,
    });
    setCoach(res);
    setCoachLoading(false);
  };

  return (
    <div className="space-y-4" onMouseUp={handleMouseUp}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">StarM Notes</div>
            <div className="text-sm text-neutral-400">Deep study notes with examples — highlight text → Ask StarM</div>
          </div>
        </div>
        {selection && (
          <Button size="sm" icon={<Highlighter className="w-4 h-4" />} onClick={askStarM} className="shrink-0" disabled={!mentorAllowed}>
            Ask StarM
          </Button>
        )}
      </div>

      {!mentorAllowed && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-amber-200">
          <div className="flex items-center gap-2">
            <Badge color="amber">Pro</Badge>
            <span>StarM AI Coach is a Pro feature.</span>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
            View plans
          </Button>
        </div>
      )}

      {sections.map((section) => {
        const isOpen = expanded[section.id] !== false;
        return (
          <Card key={section.id} className="border-white/5 overflow-hidden" padding="p-0">
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] text-left"
              onClick={() => setExpanded((e) => ({ ...e, [section.id]: !isOpen }))}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">{section.title}</span>
              </div>
              {isOpen ? <ChevronDown className="w-5 h-5 text-neutral-500" /> : <ChevronRight className="w-5 h-5 text-neutral-500" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-5 border-t border-white/5 pt-4 select-text cursor-text">
                <RichNoteText text={section.content} />
                {section.keyPoints.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Key points</p>
                    <ul className="space-y-2">
                      {section.keyPoints.map((kp) => (
                        <li key={kp} className="flex gap-2 text-sm text-neutral-300 bg-neutral-950/80 p-3 rounded-xl border border-white/5">
                          <span className="text-indigo-400 shrink-0">▸</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {section.checkpoint && (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/20">
                    <p className="text-sm font-semibold text-amber-200 mb-2">🎯 Checkpoint</p>
                    <p className="text-sm text-neutral-300 mb-2">{section.checkpoint.question}</p>
                    {revealedCheckpoint[section.id] ? (
                      <p className="text-sm text-emerald-400">{section.checkpoint.answer}</p>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setRevealedCheckpoint((r) => ({ ...r, [section.id]: true }))}>
                        Reveal answer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {showCoach && (
        <StarMCoachPanel
          response={coach}
          loading={coachLoading}
          selection={selection}
          onClose={() => {
            setShowCoach(false);
            setSelection('');
          }}
        />
      )}
    </div>
  );
}
