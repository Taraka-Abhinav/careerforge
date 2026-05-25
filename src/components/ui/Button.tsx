import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', size = 'md', icon, children, className, ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-normal text-center break-words max-w-full relative overflow-hidden backdrop-blur-sm";
  
  const variants = {
    primary: "bg-gradient-to-b from-indigo-500 to-indigo-700 text-white border border-white/10 shadow-[0_10px_30px_rgba(79,70,229,0.35)] hover:from-indigo-400 hover:to-indigo-600 hover:shadow-[0_12px_36px_rgba(79,70,229,0.45)] focus:ring-indigo-400",
    secondary: "bg-white/5 hover:bg-white/10 text-neutral-100 border border-white/10 hover:border-white/20 shadow-[0_8px_24px_rgba(15,23,42,0.35)] focus:ring-white/30",
    ghost: "bg-transparent text-neutral-300 hover:text-white hover:bg-white/5 border border-transparent focus:ring-white/20"
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs gap-1.5",
    md: "px-4.5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2",
    xl: "px-8 py-4 text-base gap-2.5"
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {icon && <span className="flex items-center shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
