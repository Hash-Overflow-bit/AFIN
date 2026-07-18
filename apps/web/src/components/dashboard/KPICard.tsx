import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { LucideIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

export function KPICard({ title, value, icon: Icon, prefix = '', suffix = '', tooltip }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 relative group shadow-sm hover:z-50"
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-[#1f1633] dark:text-white">
          <Icon size={120} />
        </div>
      </div>
      <div className="flex items-center mb-3">
        <p className="text-[#79628c] dark:text-on-dark-muted font-medium text-xs tracking-widest uppercase flex items-center gap-2 m-0">
          <Icon size={14} /> {title}
        </p>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <h3 
        className="text-3xl lg:text-4xl font-bold text-[#1f1633] dark:text-white tracking-tight relative z-10 truncate"
        title={`${prefix}${value.toLocaleString()}${suffix}`}
      >
        <CountUp
          end={value}
          duration={2}
          separator=","
          prefix={prefix}
          suffix={suffix}
          decimals={value % 1 !== 0 ? 2 : 0}
        />
      </h3>
    </motion.div>
  );
}
