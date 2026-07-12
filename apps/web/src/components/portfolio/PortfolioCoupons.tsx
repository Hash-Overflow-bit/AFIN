'use client';

import { motion } from 'framer-motion';
import { CouponPayment } from '@/lib/api/portfolio';
import { Calendar } from 'lucide-react';

interface Props {
  coupons: CouponPayment[];
}

export default function PortfolioCoupons({ coupons }: Props) {
  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6 }}
      className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 h-full shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#1f1633] dark:text-white mb-6 flex items-center gap-2">
        <Calendar size={20} className="text-[#6a5fc1] dark:text-accent-lime" /> Upcoming Coupons
      </h3>
      
      <div className="space-y-4">
        {coupons.length === 0 ? (
          <p className="text-[#79628c] dark:text-on-dark-muted text-sm">No scheduled coupons.</p>
        ) : (
          coupons.slice(0, 5).map((coupon, i) => (
            <div key={coupon.id} className="flex justify-between items-center p-3 rounded-xl bg-[#f9fafb] dark:bg-[#1a1130] border border-[#e5e7eb] dark:border-hairline-violet hover:bg-white dark:hover:bg-[#1f1735]/40 transition-colors">
              <div>
                <p className="text-sm font-semibold text-[#1f1633] dark:text-white">{coupon.bond.name}</p>
                <p className="text-xs text-[#79628c] dark:text-on-dark-muted mt-0.5">
                  {new Date(coupon.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#6a5fc1] dark:text-accent-lime">{formatter.format(Number(coupon.amount))}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${
                  coupon.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {coupon.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
