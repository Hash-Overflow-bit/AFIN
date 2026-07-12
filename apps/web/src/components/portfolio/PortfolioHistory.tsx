'use client';

import { motion } from 'framer-motion';
import { ActivityLog } from '@/lib/api/portfolio';
import { Clock } from 'lucide-react';

interface Props {
  history: ActivityLog[];
}

export default function PortfolioHistory({ history }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.7 }}
      className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 h-full shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#1f1633] dark:text-white mb-6 flex items-center gap-2">
        <Clock size={20} className="text-[#6a5fc1] dark:text-accent-lime" /> Recent Activity
      </h3>
      
      <div className="relative border-l border-[#e5e7eb] dark:border-hairline-violet ml-3 space-y-6">
        {history.length === 0 ? (
          <p className="text-[#79628c] dark:text-on-dark-muted text-sm ml-4">No recent activity.</p>
        ) : (
          history.slice(0, 10).map((log, i) => (
            <div key={log.id} className="relative pl-6">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#6a5fc1] dark:bg-accent-lime ring-4 ring-white dark:ring-ink-deep"></span>
              <p className="text-sm font-medium text-[#1f1633] dark:text-white">{log.action}</p>
              <p className="text-xs text-[#79628c] dark:text-on-dark-muted mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
