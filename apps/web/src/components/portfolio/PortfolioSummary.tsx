'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { PortfolioSummary as SummaryType } from '@/lib/api/portfolio';
import { Wallet, PieChart, TrendingUp } from 'lucide-react';

interface Props {
  summary: SummaryType;
}

export default function PortfolioSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-[#e5e7eb] rounded-2xl p-6 relative overflow-hidden group shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#1f1633]">
          <Wallet size={120} />
        </div>
        <p className="text-[#79628c] font-medium text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
          <Wallet size={14} /> Total Invested
        </p>
        <h3 className="text-4xl md:text-5xl font-bold text-[#1f1633] tracking-tight">
          <CountUp
            end={summary.totalInvested}
            duration={2.5}
            separator=","
            prefix="MT "
          />
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-[#e5e7eb] rounded-2xl p-6 relative overflow-hidden group shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#1f1633]">
          <PieChart size={120} />
        </div>
        <p className="text-[#79628c] font-medium text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
          <PieChart size={14} /> Active Holdings
        </p>
        <h3 className="text-4xl md:text-5xl font-bold text-[#1f1633] tracking-tight">
          <CountUp
            end={summary.holdingsCount}
            duration={2}
          />
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#f9fafb] to-white border border-[#e5e7eb] rounded-2xl p-6 relative overflow-hidden group shadow-sm shadow-[#422082]/5"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#6a5fc1]">
          <TrendingUp size={120} />
        </div>
        <p className="text-[#6a5fc1] font-medium text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
          <TrendingUp size={14} /> Average Yield
        </p>
        <h3 className="text-4xl md:text-5xl font-bold text-[#422082] tracking-tight">
          <CountUp
            end={summary.averageYield}
            duration={2}
            decimals={2}
            suffix="%"
          />
        </h3>
      </motion.div>
    </div>
  );
}
