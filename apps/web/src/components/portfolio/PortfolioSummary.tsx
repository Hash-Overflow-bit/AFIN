'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { PortfolioSummary as SummaryType } from '@/lib/api/portfolio';
import { Wallet, PieChart, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  summary: SummaryType;
}

export default function PortfolioSummary({ summary }: Props) {
  const t = useTranslations("Portfolio");
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 relative overflow-hidden group shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#1f1633] dark:text-white">
          <Wallet size={120} />
        </div>
        <p className="text-[#79628c] dark:text-on-dark-muted font-medium text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
          <Wallet size={14} /> {t('totalInvested')}
        </p>
        <h3 className="text-4xl md:text-5xl font-bold text-[#1f1633] dark:text-white tracking-tight">
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
        className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 relative overflow-hidden group shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#1f1633] dark:text-white">
          <PieChart size={120} />
        </div>
        <p className="text-[#79628c] dark:text-on-dark-muted font-medium text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
          <PieChart size={14} /> {t('activeHoldings')}
        </p>
        <h3 className="text-4xl md:text-5xl font-bold text-[#1f1633] dark:text-white tracking-tight">
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
        className="bg-gradient-to-br from-[#f9fafb] dark:from-[#1a1130] to-white dark:to-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 relative overflow-hidden group shadow-sm shadow-[#422082]/5"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#6a5fc1] dark:text-accent-lime">
          <TrendingUp size={120} />
        </div>
        <p className="text-[#6a5fc1] dark:text-accent-lime font-medium text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
          <TrendingUp size={14} /> {t('averageYield')}
        </p>
        <h3 className="text-4xl md:text-5xl font-bold text-[#422082] dark:text-accent-lime tracking-tight">
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
