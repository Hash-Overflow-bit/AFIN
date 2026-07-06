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
      className="bg-white border border-[#e5e7eb] rounded-2xl p-6 h-full shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#1f1633] mb-6 flex items-center gap-2">
        <Clock size={20} className="text-[#6a5fc1]" /> Recent Activity
      </h3>
      
      <div className="relative border-l border-[#e5e7eb] ml-3 space-y-6">
        {history.length === 0 ? (
          <p className="text-[#79628c] text-sm ml-4">No recent activity.</p>
        ) : (
          history.slice(0, 10).map((log, i) => (
            <div key={log.id} className="relative pl-6">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#6a5fc1] ring-4 ring-white"></span>
              <p className="text-sm font-medium text-[#1f1633]">{log.action}</p>
              <p className="text-xs text-[#79628c] mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
