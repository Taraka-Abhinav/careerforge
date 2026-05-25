import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: string;
  hover?: boolean;
}

export const Card = ({ padding = "p-6", hover = true, className, children, ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        "rounded-2xl border border-white/5 bg-[#111111]/80 backdrop-blur-xl transition-all duration-400 relative overflow-hidden",
        hover && "hover:border-white/10 hover:bg-[#161616]/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5",
        padding,
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
