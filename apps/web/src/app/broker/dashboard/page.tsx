'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { KPICard } from '@/components/dashboard/KPICard';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { OrderStatusChart } from '@/components/dashboard/OrderStatusChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Users, FileText, BarChart3, Banknote, ShieldAlert, Loader2 } from 'lucide-react';

export default function BrokerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data. Please try again later.');
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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6a5fc1] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center px-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-[#1f1633] font-semibold text-lg mb-2">Access Error</h3>
          <p className="text-[#79628c] text-sm">{error || 'Dashboard data is unavailable.'}</p>
        </div>
      </div>
    );
  }

  return (
    // <ProtectedRoute allowedRoles={['BROKER_MANAGER', 'BROKER_ANALYST', 'ADMIN']}>
      <div className="space-y-8 pb-12 max-w-[1152px] mx-auto">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1f1633] leading-tight">
            Broker Dashboard
          </h1>
          <p className="text-[#79628c] mt-2 text-sm">
            Platform overview and quantitative analytics.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Total AUM" 
            value={data.kpis.totalAUM} 
            icon={Banknote} 
            suffix=" MZN"
            tooltip="Total Assets Under Management across all active portfolio holdings."
          />
          <KPICard 
            title="Total Investors" 
            value={data.kpis.totalInvestors} 
            icon={Users} 
            tooltip="Number of verified investor accounts registered on the platform."
          />
          <KPICard 
            title="Active Offerings" 
            value={data.kpis.activeBonds} 
            icon={FileText} 
            tooltip="Number of bonds currently open for subscription."
          />
          <KPICard 
            title="Orders Processed" 
            value={data.kpis.totalOrders} 
            icon={BarChart3} 
            tooltip="Total number of orders submitted across the platform's lifetime."
          />
        </div>

        {/* KYC Verification Queue */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[18px] font-bold text-[#1f1633] tracking-tight">KYC Verification Queue</h3>
              <p className="text-sm text-[#79628c] mt-0.5">Review submitted credentials from pending investors.</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-[10px] font-bold text-amber-700 uppercase">
              {kycQueue.length} Pending
            </span>
          </div>

          {kycLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#6a5fc1] animate-spin" />
            </div>
          ) : kycQueue.length === 0 ? (
            <div className="text-center py-8 bg-[#f9fafb] rounded-lg border border-dashed border-[#cfcfdb]">
              <p className="text-sm text-[#79628c]">All caught up! There are no pending KYC submissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-xs font-semibold text-[#79628c] uppercase tracking-wider">
                    <th className="py-3 px-4">Investor Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] text-sm text-[#1f1633]">
                  {kycQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        {item.user.firstName} {item.user.lastName}
                      </td>
                      <td className="py-3.5 px-4 text-[#79628c] font-medium">{item.user.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-100 text-amber-800">
                          {item.kycStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/broker/investor/${item.userId}`}
                          className="inline-flex items-center text-xs font-bold text-[#6a5fc1] hover:text-[#422082] uppercase tracking-wider transition-colors"
                        >
                          Review & Verify &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts and Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex-1">
              <VolumeChart data={data.volumeChart} />
            </div>
            <div className="flex-1">
              <OrderStatusChart data={data.orderStatusBreakdown} />
            </div>
          </div>
          <div className="lg:col-span-1 h-[850px]">
            <ActivityFeed activities={data.activityFeed} />
          </div>
        </div>
      </div>
    // </ProtectedRoute>
  );
}
