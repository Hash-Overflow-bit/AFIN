import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-12 text-center bg-[#f9fafb] dark:bg-ink-deep border border-dashed border-[#cfcfdb] dark:border-hairline-violet rounded-2xl">
      <div className="p-3.5 bg-slate-100 dark:bg-surface-night rounded-full text-[#79628c] dark:text-accent-violet mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-[#1f1633] dark:text-on-primary font-bold text-lg mb-1 tracking-tight">{title}</h4>
      <p className="text-[#79628c] dark:text-on-dark-muted text-sm max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-violet px-5 py-2.5 rounded-lg shadow-sm font-semibold uppercase tracking-wider text-xs">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
