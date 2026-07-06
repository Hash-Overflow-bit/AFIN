import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  return (
    <div className="relative group inline-flex items-center ml-1.5 cursor-help hover:z-50">
      <Info size={14} className="text-[#a08ab3] hover:text-[#6a5fc1] transition-colors" />
      <div className="absolute z-[9999] left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2.5 bg-[#1f1633] text-white text-xs rounded-lg shadow-xl text-center font-normal normal-case tracking-normal after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#1f1633]">
        {content}
      </div>
    </div>
  );
}
