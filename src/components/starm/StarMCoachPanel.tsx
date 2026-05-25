import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import type { CoachResponse } from '../../services/starmService';

interface StarMCoachPanelProps {
  response: CoachResponse | null;
  loading: boolean;
  selection: string;
  onClose: () => void;
}

export function StarMCoachPanel({ response, loading, selection, onClose }: StarMCoachPanelProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[420px] z-[100] animate-fade-in-up">
      <Card className="border-indigo-500/40 bg-neutral-950/95 shadow-[0_0_40px_rgba(79,70,229,0.25)] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600/30 to-purple-600/20 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">StarM AI Coach</div>
              <div className="text-[10px] text-neutral-400 truncate max-w-[240px]">"{selection.slice(0, 50)}{selection.length > 50 ? '…' : ''}"</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white text-sm px-2">✕</button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-indigo-400 py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">StarM is thinking…</span>
            </div>
          )}

          {response && !loading && (
            <>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Explanation</h4>
                <p className="text-sm text-neutral-200 leading-relaxed">{response.explanation}</p>
              </div>
              {response.analogy && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="text-xs font-bold text-indigo-300 mb-1">Analogy</h4>
                  <p className="text-sm text-neutral-300">{response.analogy}</p>
                </div>
              )}
              {response.followUps?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">Check your understanding</h4>
                  {response.followUps.map((fu, i) => (
                    <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-3 text-left text-sm font-semibold text-white hover:bg-white/5"
                        onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      >
                        {fu.question}
                        {openIdx === i ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                      </button>
                      {openIdx === i && (
                        <div className="px-3 pb-3 text-sm text-neutral-400 border-t border-white/5 pt-2">{fu.answer}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {response.proTip && (
                <p className="text-xs text-neutral-500 border-l-2 border-indigo-500 pl-3">
                  <strong className="text-indigo-400">Pro tip:</strong> {response.proTip}
                </p>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
