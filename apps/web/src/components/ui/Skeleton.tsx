import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-slate-200 dark:bg-hairline-violet rounded-md ${className}`} 
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-[#e5e7eb] dark:border-hairline-violet">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className={`h-4 ${i === 0 ? 'w-2/3' : i === cols - 1 ? 'w-1/2 ml-auto' : 'w-3/4'}`} />
        </td>
      ))}
    </tr>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
  );
}
