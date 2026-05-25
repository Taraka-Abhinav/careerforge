import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy, Filter, Zap } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../supabase/client';
import { ChallengeService } from '../services/challengeService';
import { ARENA_CHALLENGE_BANK } from '../content/challengeBank';
import type { ChallengeRecord } from '../types';
import { cn } from '../utils/cn';

export default function ChallengesPage() {
  const [daily, setDaily] = useState<ChallengeRecord[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const navigate = useNavigate();

  const library = ChallengeService.getArenaLibrary();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setDaily(await ChallengeService.assignDailyChallenges(user.id));
      setCompleted(await ChallengeService.getCompletionMap(user.id));
    })();
  }, []);

  const filtered =
    filter === 'All' ? library : library.filter((c) => c.difficulty === filter);

  const counts = {
    Easy: ARENA_CHALLENGE_BANK.filter((c) => c.difficulty === 'Easy').length,
    Medium: ARENA_CHALLENGE_BANK.filter((c) => c.difficulty === 'Medium').length,
    Hard: ARENA_CHALLENGE_BANK.filter((c) => c.difficulty === 'Hard').length,
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <Target className="text-indigo-400 w-10 h-10" /> Code Arena
          </h1>
          <p className="text-neutral-400 mt-2">
            {ARENA_CHALLENGE_BANK.length} challenges — {counts.Easy} rigorous Easy, {counts.Medium} Medium, {counts.Hard} Hard.
          </p>
        </header>

        {daily.length > 0 && (
          <section>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-400" /> Today&apos;s picks
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {daily.map((c) => (
                <Card
                  key={c.id}
                  padding="p-4"
                  className="cursor-pointer hover:border-indigo-500/40 border-indigo-500/20"
                  onClick={() => navigate(`/arena/${c.id}`)}
                >
                  <Badge color="amber" className="mb-2">{c.difficulty}</Badge>
                  <h3 className="font-bold text-sm">{c.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{c.xpReward} XP</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold border transition-all',
                filter === f ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 text-neutral-400 hover:border-white/30'
              )}
            >
              {f} {f !== 'All' && `(${counts[f]})`}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.map((c) => (
            <Card
              key={c.id}
              padding="p-5"
              className="flex justify-between items-center cursor-pointer hover:border-indigo-500/30 transition-all"
              onClick={() => navigate(`/arena/${c.id}`)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge color="indigo">{c.type}</Badge>
                  <Badge color={c.difficulty === 'Easy' ? 'emerald' : c.difficulty === 'Medium' ? 'amber' : 'rose'}>
                    {c.difficulty}
                  </Badge>
                  {completed[c.id] && <Badge color="emerald">Solved</Badge>}
                </div>
                <h3 className="font-bold text-white">{c.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-1">{c.description}</p>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold shrink-0 ml-4">
                <Trophy className="w-4 h-4" /> {c.xpReward} XP
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
