'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip } from './Tooltip';

interface VolumeChartProps {
  data: {
    date: string;
    volume: number;
  }[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 h-full min-h-[400px] flex items-center justify-center shadow-sm">
        <p className="text-[#79628c] dark:text-on-dark-muted">No volume data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center">
          <h3 className="text-[#1f1633] dark:text-white font-bold text-lg tracking-tight">Trading Volume</h3>
          <Tooltip content="Shows the total aggregated requested amount of all orders placed over the last 30 days." />
        </div>
        <p className="text-[#79628c] dark:text-on-dark-muted text-sm mt-1">30-day aggregate requested volume</p>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6a5fc1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6a5fc1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#362d59' : '#e5e7eb'} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke={isDark ? 'rgba(255,255,255,0.48)' : '#79628c'} 
              fontSize={11} 
              tickFormatter={(val) => format(parseISO(val), 'MMM dd')}
              tickLine={false}
              axisLine={false}
              dy={15}
            />
            <YAxis 
              stroke={isDark ? 'rgba(255,255,255,0.48)' : '#79628c'} 
              fontSize={11}
              tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#1a1130' : '#ffffff', 
                borderColor: isDark ? '#362d59' : '#e5e7eb', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}
              itemStyle={{ color: isDark ? '#ffffff' : '#1f1633', fontWeight: 600 }}
              labelStyle={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#79628c', marginBottom: '8px', fontSize: '12px' }}
              labelFormatter={(val) => format(parseISO(val as string), 'MMMM dd, yyyy')}
              formatter={(value: any) => {
                const numValue = typeof value === 'number' ? value : Number(value || 0);
                return [`${numValue.toLocaleString()} MZN`, 'Volume'];
              }}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#6a5fc1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVolume)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: isDark ? '#c2ef4e' : '#422082' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
