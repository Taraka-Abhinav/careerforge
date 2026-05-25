import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'indigo' | 'purple' | 'emerald' | 'green' | 'amber' | 'neutral' | 'rose';
  children: React.ReactNode;
}

export const Badge = ({ color = 'indigo', className, children, ...props }: BadgeProps) => {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    neutral: "bg-white/5 text-neutral-300 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
        colors[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
