import React from 'react';

interface PageHeaderProps {
  title: string;
  desc: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, desc, action }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-white/[0.04]">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">{title}</h1>
        <p className="text-sm font-medium text-neutral-400 max-w-2xl leading-relaxed">{desc}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
