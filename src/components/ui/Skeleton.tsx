import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "bg-neutral-800/50 rounded-xl relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-skeleton" />
    </div>
  );
};