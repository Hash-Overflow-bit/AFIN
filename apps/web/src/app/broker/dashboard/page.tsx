'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { KPICard } from '@/components/dashboard/KPICard';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { OrderStatusChart } from '@/components/dashboard/OrderStatusChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Users, FileText, BarChart3, Banknote, ShieldAlert, Loader2 } from 'lucide-react';
// import { ProtectedRoute } from '@/components/auth/ProtectedRoute'; // Assuming this exists

export default function BrokerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    fetchDashboard();
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
