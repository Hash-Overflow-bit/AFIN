'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { KPICard } from '@/components/dashboard/KPICard';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { OrderStatusChart } from '@/components/dashboard/OrderStatusChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Users, FileText, BarChart3, Banknote, ShieldAlert, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton, KPICardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function BrokerDashboardPage() {
  const t = useTranslations("Broker");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [kycLoading, setKycLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(t('failedLoadDashboard'));
      } finally {
        setLoading(false);
      }
    };

    const fetchKycQueue = async () => {
      try {
        setKycLoading(true);
        const response = await api.get('/investors/kyc-queue');
        setKycQueue(response.data);
      } catch (err) {
        console.error('Error fetching KYC queue:', err);
      } finally {
        setKycLoading(false);
      }
    };

    Promise.all([fetchDashboard(), fetchKycQueue()]);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-12 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
        {/* KYC Queue */}
        <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center px-4">
        <div className="bg-white dark:bg-ink-deep border border-rose-200 dark:border-red-900/30 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-[#1f1633] dark:text-white font-semibold text-lg mb-2">{t('accessErrorTitle')}</h3>
          <p className="text-[#79628c] dark:text-on-dark-muted text-sm">{error || t('accessErrorDesc')}</p>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1f1633] dark:text-white leading-tight">
            {t('dashboardTitle')}
          </h1>
          <p className="text-[#79628c] dark:text-on-dark-muted mt-2 text-sm">
            {t('dashboardSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/broker/bonds/create"
            className="px-4 py-2 bg-[#6a5fc1] hover:bg-[#5b51a8] dark:bg-accent-lime dark:hover:bg-[#a6d120] text-white dark:text-[#1f1633] text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            + {t('navIssueBond')}
          </Link>
        </div>
      </div>

      {user?.kycStatus === 'DOCUMENTS_SUBMITTED' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl flex items-center gap-3">
          <Clock className="text-amber-600 dark:text-amber-400 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="text-amber-800 dark:text-amber-300 font-bold text-sm">{t('accountUnderReviewTitle')}</h3>
            <p className="text-amber-700 dark:text-amber-400/80 text-xs mt-0.5">{t('accountUnderReviewDesc')}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title={t('kpiTotalAUM')} 
          value={data.kpis.totalAUM} 
          icon={Banknote} 
          suffix=" MZN"
          tooltip={t('kpiTotalAUMTooltip')}
        />
        <KPICard 
          title={t('kpiTotalInvestors')} 
          value={data.kpis.totalInvestors} 
          icon={Users} 
          tooltip={t('kpiTotalInvestorsTooltip')}
        />
        <KPICard 
          title={t('kpiActiveOfferings')} 
          value={data.kpis.activeBonds} 
          icon={FileText} 
          tooltip={t('kpiActiveOfferingsTooltip')}
        />
        <KPICard 
          title={t('kpiOrdersProcessed')} 
          value={data.kpis.totalOrders} 
          icon={BarChart3} 
          tooltip={t('kpiOrdersProcessedTooltip')}
        />
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (65%) - Action & Performance */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="w-full">
            <VolumeChart data={data.volumeChart} />
          </div>

          {/* KYC Verification Queue */}
          <div className="bg-white dark:bg-ink-deep rounded-xl border border-[#e5e7eb] dark:border-hairline-violet p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[18px] font-bold text-[#1f1633] dark:text-white tracking-tight">{t('kycQueueTitle')}</h3>
                <p className="text-sm text-[#79628c] dark:text-on-dark-muted mt-0.5">{t('kycQueueSubtitle')}</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-md text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                {kycQueue.length} {t('pendingLabel')}
              </span>
            </div>

            {kycLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : kycQueue.length === 0 ? (
              <EmptyState 
                icon={CheckCircle2}
                title={t('allCaughtUpTitle')}
                description={t('allCaughtUpDesc')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f9fafb] dark:bg-[#1a1130] border-b border-[#e5e7eb] dark:border-hairline-violet text-xs font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider">
                      <th className="py-3 px-4">{t('colInvestorName')}</th>
                      <th className="py-3 px-4">{t('colEmail')}</th>
                      <th className="py-3 px-4">{t('colStatus')}</th>
                      <th className="py-3 px-4 text-right">{t('colActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] dark:divide-hairline-violet text-sm text-[#1f1633] dark:text-white">
                    {kycQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#1f1735]/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold">
                          {item.user.firstName} {item.user.lastName}
                        </td>
                        <td className="py-3.5 px-4 text-[#79628c] dark:text-on-dark-muted font-medium">{item.user.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {item.kycStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/broker/investor/${item.userId}`}
                            className="inline-flex items-center text-xs font-bold text-[#6a5fc1] dark:text-accent-lime hover:text-[#422082] dark:hover:text-white uppercase tracking-wider transition-colors"
                          >
                            {t('reviewVerifyBtn')} &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (35%) - Status & Ledger */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="w-full">
            <OrderStatusChart data={data.orderStatusBreakdown} />
          </div>
          <div className="w-full h-[600px]">
            <ActivityFeed activities={data.activityFeed} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
