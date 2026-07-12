'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip } from './Tooltip';

interface OrderStatusChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

// Light / Dark color palette mapping
const COLORS = {
  PENDING_REVIEW: '#d97706', // amber-600
  AWAITING_PAYMENT: '#3b82f6', // blue-500
  ALLOCATED: '#10b981', // emerald-500
  REJECTED: '#ef4444', // red-500
  CANCELLED: '#64748b', // slate-500
  DEFAULT: '#6a5fc1', // theme purple
};

const CUSTOM_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Requested (Pending)',
  AWAITING_PAYMENT: 'Awaiting Payment',
  ALLOCATED: 'Total Allocations',
  REJECTED: 'Failures (Rejected)',
  CANCELLED: 'Failures (Cancelled)',
};

const formatName = (name: string) => {
  if (CUSTOM_LABELS[name]) return CUSTOM_LABELS[name];
  return name.replace(/_/g, ' ').replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 h-full min-h-[400px] flex items-center justify-center shadow-sm">
        <p className="text-[#79628c] dark:text-on-dark-muted">No order data available.</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    displayName: formatName(d.name)
  }));

  const totalOrders = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-2">
        <div className="flex items-center">
          <h3 className="text-[#1f1633] dark:text-white font-bold text-lg tracking-tight">Order Pipeline</h3>
          <Tooltip content="Live distribution of all orders currently moving through the platform, grouped by their exact status." />
        </div>
        <p className="text-[#79628c] dark:text-on-dark-muted text-sm mt-1">Current distribution by status</p>
      </div>
      <div className="flex-1 w-full min-h-[250px] relative">
        {/* Centered Total Label inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: '36px' }}>
          <span className="text-3xl font-bold text-[#1f1633] dark:text-white">{totalOrders.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-widest mt-0.5">Total</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={115}
              paddingAngle={3}
              dataKey="value"
              nameKey="displayName"
              stroke="none"
              cornerRadius={6}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.DEFAULT} 
                />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#1a1130' : '#ffffff', 
                borderColor: isDark ? '#362d59' : '#e5e7eb', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}
              itemStyle={{ color: isDark ? '#ffffff' : '#1f1633', fontWeight: 600 }}
              formatter={(value: any) => {
                const numValue = typeof value === 'number' ? value : Number(value || 0);
                return [numValue.toLocaleString(), 'Orders'];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.72)' : '#79628c', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
