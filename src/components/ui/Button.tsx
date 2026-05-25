import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', size = 'md', icon, children, className, ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] whitespace-normal text-center break-words max-w-full relative overflow-hidden";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_20px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_30px_rgba(79,70,229,0.3)] focus:ring-indigo-500 border border-indigo-500/50",
    secondary: "bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 border border-white/10 hover:border-white/20 shadow-md focus:ring-neutral-500",
    ghost: "bg-transparent hover:bg-white/[0.08] text-neutral-400 hover:text-white focus:ring-neutral-500"
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
