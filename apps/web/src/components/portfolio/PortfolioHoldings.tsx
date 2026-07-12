'use client';

import { motion } from 'framer-motion';
import { PortfolioHolding } from '@/lib/api/portfolio';

interface Props {
  holdings: PortfolioHolding[];
}

export default function PortfolioHoldings({ holdings }: Props) {
  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 overflow-hidden shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#1f1633] dark:text-white mb-6">Active Holdings</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#4b5563]">
          <thead className="text-xs text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider bg-[#f9fafb] dark:bg-[#1a1130] border-b border-[#e5e7eb] dark:border-hairline-violet">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-lg">Bond</th>
              <th className="px-4 py-3 font-medium">Face Value</th>
              <th className="px-4 py-3 font-medium">Yield</th>
              <th className="px-4 py-3 font-medium rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#79628c] dark:text-on-dark-muted">
                  No active holdings found.
                </td>
              </tr>
            ) : (
              holdings.map((holding, i) => (
                <tr key={holding.id} className="border-b border-[#e5e7eb] dark:border-hairline-violet hover:bg-[#f9fafb] dark:hover:bg-[#1f1735]/40 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[#1f1633] dark:text-white">{holding.bond.name}</div>
                    <div className="text-xs text-[#79628c] dark:text-on-dark-muted mt-1">Acquired: {new Date(holding.acquiredAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-4 font-medium text-[#1f1633] dark:text-white">
                    {formatter.format(Number(holding.faceValueHeld))}
                  </td>
                  <td className="px-4 py-4 font-medium text-[#6a5fc1] dark:text-accent-lime">
                    {holding.bond.yieldRate || holding.bond.couponRate}%
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {holding.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
