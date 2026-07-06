'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CouponPayment } from '@/lib/api/portfolio';

interface Props {
  coupons: CouponPayment[];
}

export default function PortfolioChart({ coupons }: Props) {
  const data = coupons.reduce((acc: any[], curr) => {
    const date = new Date(curr.paymentDate);
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    const existing = acc.find(item => item.name === monthYear);
    if (existing) {
      existing.value += Number(curr.amount);
    } else {
      acc.push({ name: monthYear, value: Number(curr.amount), fullDate: curr.paymentDate });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const chartData = data.length > 0 ? data : [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4 }}
      className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#1f1633] mb-6">Projected Coupon Cashflows</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6a5fc1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6a5fc1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" stroke="#79628c" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#79628c" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `MT ${val/1000}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f1633', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#422082', fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="value" stroke="#6a5fc1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
