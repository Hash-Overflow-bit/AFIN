'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bondsApi, Bond } from '@/lib/api/bonds';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, TrendingUp, Calendar, Info, ArrowRight } from 'lucide-react';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function MarketplacePage() {
  const t = useTranslations("Marketplace");
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchBonds = async () => {
      setLoading(true);
      try {
        const result = await bondsApi.getBonds({ search: debouncedSearch, limit: 20 });
        setBonds(result.data);
      } catch (error) {
        console.error('Failed to fetch marketplace bonds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBonds();
  }, [debouncedSearch]);

  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10 min-h-screen bg-white dark:bg-[#0a0514] text-[#1f1633] dark:text-white font-sans transition-colors duration-200"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#1f1633] dark:text-white leading-tight">
            {t('title')}
          </h1>
          <p className="text-[#79628c] dark:text-on-dark-muted mt-2 text-[16px]">{t('subtitle')}</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cfcfdb]" size={20} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-ink-deep border border-[#cfcfdb] dark:border-hairline-violet rounded-[6px] pl-[40px] pr-[12px] py-[8px] text-[#1f1633] dark:text-white text-[16px] focus:outline-none focus:border-[#6a5fc1] dark:focus:border-accent-lime focus:ring-1 focus:ring-[#9dc1f5] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : bonds.length === 0 ? (
        <EmptyState 
          icon={Info}
          title={t('noBondsTitle')}
          description={t('noBondsDesc')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonds.map((bond, idx) => (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Link href={`/marketplace/${bond.id}`} className="group block h-full">
                <div className="h-full bg-white dark:bg-ink-deep rounded-[12px] border border-[#e5e7eb] dark:border-hairline-violet p-[24px] hover:border-[#cfcfdb] dark:hover:border-accent-lime hover:shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px] transition-all duration-300 relative flex flex-col">
                  
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-[20px] font-bold text-[#1f1633] dark:text-white group-hover:text-[#6a5fc1] dark:group-hover:text-accent-lime transition-colors line-clamp-2">
                      {bond.name}
                    </h3>
                    {bond.status === 'OPEN' ? (
                      <span className="shrink-0 ml-4 px-[8px] py-[4px] text-[10px] font-bold tracking-[0.25px] uppercase bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-[4px] border border-emerald-200 dark:border-emerald-900/50">
                        {t('statusOpen')}
                      </span>
                    ) : bond.status === 'ALLOCATED' ? (
                      <span className="shrink-0 ml-4 px-[8px] py-[4px] text-[10px] font-bold tracking-[0.25px] uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-[4px] border border-amber-200 dark:border-amber-900/50">
                        {t('statusSoldOut')}
                      </span>
                    ) : (
                      <span className="shrink-0 ml-4 px-[8px] py-[4px] text-[10px] font-bold tracking-[0.25px] uppercase bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-400 rounded-[4px] border border-gray-300 dark:border-slate-800">
                        {t('statusClosed')}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#f9fafb] dark:bg-[#1a1130] p-3 rounded-[6px] border border-[#e5e7eb] dark:border-hairline-violet">
                      <p className="text-[#79628c] dark:text-on-dark-muted text-[12px] font-semibold mb-1 flex items-center gap-1 uppercase tracking-[0.25px]">
                        <TrendingUp size={12}/> {t('yield')}
                      </p>
                      <p className="text-[24px] font-bold text-[#1f1633] dark:text-white leading-none">{bond.couponRate}%</p>
                    </div>
                    <div className="bg-[#f9fafb] dark:bg-[#1a1130] p-3 rounded-[6px] border border-[#e5e7eb] dark:border-hairline-violet">
                      <p className="text-[#79628c] dark:text-on-dark-muted text-[12px] font-semibold mb-1 flex items-center gap-1 uppercase tracking-[0.25px]">
                        <Calendar size={12}/> {t('maturity')}
                      </p>
                      <p className="text-[20px] font-bold text-[#1f1633] dark:text-white mt-1 leading-none">
                        {new Date(bond.maturityDate).getFullYear()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#e5e7eb] dark:border-hairline-violet">
                    <div>
                      <p className="text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-[0.25px] mb-0.5">{t('minInv')}</p>
                      <p className="text-[14px] font-bold text-[#1f1633] dark:text-white">
                        {formatter.format(bond.minInvestment)}
                      </p>
                    </div>
                    <div className="text-[14px] font-bold text-[#6a5fc1] dark:text-accent-lime uppercase tracking-[0.2px] group-hover:text-[#422082] dark:group-hover:text-white transition-colors flex items-center gap-1">
                      {t('details')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
