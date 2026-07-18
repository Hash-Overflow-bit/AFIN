'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { portfolioApi, PortfolioSummary as SummaryType, PortfolioHolding, CouponPayment, ActivityLog } from '@/lib/api/portfolio';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import PortfolioChart from '@/components/portfolio/PortfolioChart';
import PortfolioHoldings from '@/components/portfolio/PortfolioHoldings';
import PortfolioCoupons from '@/components/portfolio/PortfolioCoupons';
import PortfolioHistory from '@/components/portfolio/PortfolioHistory';
import { Skeleton, KPICardSkeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Clock } from 'lucide-react';

export default function PortfolioPage() {
  const t = useTranslations("Portfolio");
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [coupons, setCoupons] = useState<CouponPayment[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [sumRes, holdRes, coupRes, histRes] = await Promise.all([
          portfolioApi.getSummary(),
          portfolioApi.getHoldings(),
          portfolioApi.getCoupons(),
          portfolioApi.getHistory()
        ]);
        
        setSummary(sumRes);
        setHoldings(holdRes);
        setCoupons(coupRes);
        setHistory(histRes);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-12 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 animate-pulse" />
          <Skeleton className="h-4 w-96 animate-pulse" />
        </div>
        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
        {/* Charts & Table placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 h-[380px] space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 h-[380px] space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12 max-w-[1440px] mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1f1633] dark:text-white leading-tight">
          {t('dashboard')}
        </h1>
        <p className="text-[#79628c] dark:text-on-dark-muted mt-2 text-sm">{t('overview')}</p>
      </div>

      {(user?.investorProfile?.kycStatus === 'DOCUMENTS_SUBMITTED' || user?.kycStatus === 'DOCUMENTS_SUBMITTED') && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl flex items-center gap-3">
          <Clock className="text-amber-600 dark:text-amber-400 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="text-amber-800 dark:text-amber-300 font-bold text-sm">{t('docsUnderReview')}</h3>
            <p className="text-amber-700 dark:text-amber-400/80 text-xs mt-0.5">{t('docsReviewDesc')}</p>
          </div>
        </div>
      )}

      {summary && <PortfolioSummary summary={summary} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart coupons={coupons} />
        </div>
        <div className="lg:col-span-1">
          <PortfolioCoupons coupons={coupons} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioHoldings holdings={holdings} />
        </div>
        <div className="lg:col-span-1">
          <PortfolioHistory history={history} />
        </div>
      </div>
    </motion.div>
  );
}
