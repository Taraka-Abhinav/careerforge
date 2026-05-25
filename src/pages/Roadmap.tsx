import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Lock, ChevronRight, RefreshCw } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { RoadmapEngine } from '../services/roadmapEngine';
import { ProfileService } from '../services/profileService';
import type { RoadmapPhase } from '../types';

export default function RoadmapPage() {
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [timelineMeta, setTimelineMeta] = useState<{ timeline: string; hoursPerWeek: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: roadmapRow } = await supabase
        .from('roadmaps')
        .select('timeline, hours_per_week')
        .eq('user_id', user.id)
        .maybeSingle();
      if (roadmapRow?.timeline) {
        setTimelineMeta({
          timeline: roadmapRow.timeline,
          hoursPerWeek: roadmapRow.hours_per_week || 10,
        });
      }
      const p = await RoadmapEngine.getPhases(user.id);
      setPhases(p);
      setLoading(false);
    })();
  }, []);

  const handleRegenerate = async () => {
    if (!userId) return;
    setRegenerating(true);
    const profile = await ProfileService.getProfile(userId);
    if (profile) {
      const p = await RoadmapEngine.regenerate(userId, profile);
      setPhases(p);
    }
    setRegenerating(false);
  };

  const skillCount = phases.reduce((n, ph) => n + ph.items.filter((i) => i.type === 'skill').length, 0);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh] text-neutral-400">Loading roadmap...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              <Compass className="text-indigo-400 w-10 h-10" /> Live Roadmap
            </h1>
            <p className="text-neutral-400 mt-2">
              {phases.length > 0
                ? `${phases.length} phases · ${skillCount} skills · aligned to your ${timelineMeta?.timeline || 'timeline'}${timelineMeta ? ` at ${timelineMeta.hoursPerWeek}h/week` : ''}`
                : 'Your personalized learning path based on your profile.'}
            </p>
          </div>
          {phases.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className={regenerating ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? 'Updating…' : 'Refresh roadmap'}
            </Button>
          )}
        </header>

        {phases.length === 0 ? (
          <Card className="p-8 text-center text-neutral-400">Complete onboarding to generate your roadmap.</Card>
        ) : (
          phases.map((phase) => (
            <Card key={phase.phase} className={`p-6 border-white/5 ${phase.locked ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{phase.phase}</h2>
                  <p className="text-sm text-indigo-300/90 font-semibold mt-1">{phase.duration}</p>
                  {phase.studyNote && <p className="text-xs text-neutral-500 mt-1">{phase.studyNote}</p>}
                </div>
                {phase.locked && <Badge color="neutral"><Lock className="w-3 h-3 inline mr-1"/>Locked</Badge>}
              </div>
              <div className="space-y-2">
                {phase.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={phase.locked || item.type !== 'skill'}
                    onClick={() => item.type === 'skill' && navigate(`/learn/${item.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-white/5 hover:border-indigo-500/30 transition-all text-left disabled:cursor-not-allowed"
                  >
                    <div>
                      <span className="font-bold text-white">{item.title}</span>
                      {item.format && (
                        <Badge color={item.format === 'Mastered' ? 'emerald' : 'neutral'} className="ml-2 text-[10px]">
                          {item.format}
                        </Badge>
                      )}
                    </div>
                    {item.type === 'skill' && !phase.locked && <ChevronRight className="w-5 h-5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
