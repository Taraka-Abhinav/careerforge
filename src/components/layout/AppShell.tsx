import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrainCircuit, Trophy } from 'lucide-react';
import { APP_NAV } from '../../config/navigation';
import { supabase } from '../../supabase/client';
import { EngagementService } from '../../services/engagementService';
import { ProgressService } from '../../services/progressService';
import type { UserProgress } from '../../types';
import { cn } from '../../utils/cn';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [progress, setProgress] = useState<UserProgress>({ xp: 0, level: 1, streakDays: 0, lastActiveDate: '' });
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user && isMounted) {
        const p = await ProgressService.getProgress(data.user.id);
        if (isMounted) setProgress(p);
        await EngagementService.trackActiveDay(data.user.id);
        const active = await ProgressService.recordActivity(data.user.id);
        if (isMounted) setProgress(active);
      }
    };

    const handleXpUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail as { progress?: UserProgress } | undefined;
      if (detail?.progress) {
        setProgress(detail.progress);
      } else {
        loadProgress();
      }
    };

    loadProgress();
    window.addEventListener('xp-updated', handleXpUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('xp-updated', handleXpUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="w-64 border-r border-white/5 bg-neutral-900/20 px-4 py-8 flex flex-col justify-between hidden md:flex min-h-screen shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
              <BrainCircuit className="text-indigo-400 w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">CareerForge</span>
          </div>
          <nav className="space-y-2">
            {APP_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-full text-xs font-bold text-neutral-300 bg-neutral-900/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:text-white hover:bg-white/5 hover:border-indigo-500/30 transition-colors"
          >
            View Plans
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4 w-full text-left hover:border-indigo-500/30 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50 shrink-0">
              <Trophy className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">
                Level {progress.level} Hacker
              </div>
              <div className="text-sm font-black text-white truncate">{progress.xp.toLocaleString()} XP</div>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 min-w-0">{children}</main>
    </div>
  );
}
