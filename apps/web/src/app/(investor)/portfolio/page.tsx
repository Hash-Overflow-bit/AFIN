'use client';

import { useEffect, useState } from 'react';
import { portfolioApi, PortfolioSummary as SummaryType, PortfolioHolding, CouponPayment, ActivityLog } from '@/lib/api/portfolio';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import PortfolioChart from '@/components/portfolio/PortfolioChart';
import PortfolioHoldings from '@/components/portfolio/PortfolioHoldings';
import PortfolioCoupons from '@/components/portfolio/PortfolioCoupons';
import PortfolioHistory from '@/components/portfolio/PortfolioHistory';
import { Loader2 } from 'lucide-react';

export default function PortfolioPage() {
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [coupons, setCoupons] = useState<CouponPayment[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#6a5fc1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-[1152px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1f1633] leading-tight">
            Portfolio Dashboard
          </h1>
          <p className="text-[#79628c] mt-2 text-sm">Overview of your investments, cashflows, and holdings.</p>
        </div>

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
      </div>
  );
}
