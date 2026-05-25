import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  progress: number;
  /** Additional classes for the outer track container. */
  containerClass?: string;
  /** Additional classes for the inner bar (e.g. custom color). */
  color?: string;
  className?: string;
  height?: string;
}

export const ProgressBar = ({ progress, containerClass, color, className, height = "h-2" }: ProgressBarProps) => {
  return (
    <div className={cn("w-full bg-neutral-850 rounded-full overflow-hidden border border-white/5", height, containerClass, className)}>
      <div 
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          color || "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} 
      />
    </div>
  );
};
