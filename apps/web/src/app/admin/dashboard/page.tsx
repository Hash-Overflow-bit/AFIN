'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { KPICard } from '@/components/dashboard/KPICard';
import { Users, ShieldAlert, Settings, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Tooltip } from '@/components/ui/Tooltip';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch users list to compute metric splits
      const usersRes = await api.get('/admin/users?limit=500');
      // Fetch latest 5 activity logs
      const logsRes = await api.get('/admin/activity-logs?limit=5');
      
      const allUsers = usersRes.data.users || [];
      const totalUsers = allUsers.length;
      const investors = allUsers.filter((u: any) => u.role === 'INVESTOR').length;
      const brokers = allUsers.filter((u: any) => u.role === 'BROKER' || u.role === 'BROKER_MANAGER').length;
      const suspended = allUsers.filter((u: any) => u.status === 'SUSPENDED').length;

      setStats({
        totalUsers,
        investors,
        brokers,
        suspended,
      });

      // Format activity logs to match the expected format for ActivityFeed
      const formattedLogs = (logsRes.data.logs || []).map((log: any) => ({
        id: log.id,
        action: log.action,
        createdAt: log.createdAt,
        userEmail: log.user?.email || 'System',
        userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        details: log.details,
      }));

      setLogs(formattedLogs);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError('Failed to load system metrics. Please check your admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-[#1f1633] font-semibold text-lg mb-2">Access Denied</h3>
          <p className="text-[#79628c] text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Re-login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1f1633]">
            System Administration
          </h1>
          <p className="text-[#79628c] mt-2 text-sm">
            Overview of users, settings configurations, and security audit log traces.
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 border border-hairline-cool hover:bg-surface-press-light rounded-md text-sm font-medium transition-colors bg-white text-ink-deep"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Registered Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          tooltip="Total accounts registered including investors, brokers, and administrators."
        />
        <KPICard 
          title="Investor Accounts" 
          value={stats?.investors || 0} 
          icon={Users} 
          tooltip="Individual and institutional investors registered in the system."
        />
        <KPICard 
          title="Broker/Manager Accounts" 
          value={stats?.brokers || 0} 
          icon={FileSpreadsheet} 
          tooltip="Financial intermediary roles managing subscriptions, KYC, and payments."
        />
        <KPICard 
          title="Suspended Users" 
          value={stats?.suspended || 0} 
          icon={ShieldAlert} 
          tooltip="Accounts currently suspended or deactivated from logging in."
        />
      </div>

      {/* Grid for Quick Actions and Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-hairline-cool p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f1633] mb-4">Quick Administrative Tools</h3>
            <div className="space-y-4">
              <Tooltip 
                position="right"
                className="w-full"
                content="Manage system actors directory: edit user profiles, promote/demote roles, or suspend user access to secure the network."
              >
                <a 
                  href="/admin/users" 
                  className="flex items-center space-x-3 p-3 rounded-lg border border-hairline-cool hover:border-red-500 hover:bg-red-50/10 transition-all text-sm font-semibold text-[#1f1633] w-full"
                >
                  <Users className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Platform Directory</div>
                    <div className="text-xs text-[#79628c] font-normal mt-0.5">Edit profiles, change roles, suspend users.</div>
                  </div>
                </a>
              </Tooltip>

              <Tooltip 
                position="right"
                className="w-full"
                content="Configure operational variables: toggle platform maintenance modes, global subscription ceilings, or mock KYC validation."
              >
                <a 
                  href="/admin/settings" 
                  className="flex items-center space-x-3 p-3 rounded-lg border border-hairline-cool hover:border-red-500 hover:bg-red-50/10 transition-all text-sm font-semibold text-[#1f1633] w-full"
                >
                  <Settings className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Configure Global Settings</div>
                    <div className="text-xs text-[#79628c] font-normal mt-0.5">Toggle maintenance mode, adjust global limits.</div>
                  </div>
                </a>
              </Tooltip>

              <Tooltip 
                position="right"
                className="w-full"
                content="Inspect immutable activity trails: audit administrative changes, user creations, setting overrides, and details delta logs."
              >
                <a 
                  href="/admin/logs" 
                  className="flex items-center space-x-3 p-3 rounded-lg border border-hairline-cool hover:border-red-500 hover:bg-red-50/10 transition-all text-sm font-semibold text-[#1f1633] w-full"
                >
                  <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Security Audit Trails</div>
                    <div className="text-xs text-[#79628c] font-normal mt-0.5">Inspect raw activity parameters and details.</div>
                  </div>
                </a>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Security Logs Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-hairline-cool p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1f1633]">Recent Security Audits</h3>
              <a href="/admin/logs" className="text-sm font-medium text-red-600 hover:underline">
                View All Logs
              </a>
            </div>
            
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#79628c] space-y-2">
                <ShieldAlert className="w-8 h-8 text-[#79628c]/40" />
                <p className="text-sm">No activity logs recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 pb-4 border-b border-hairline-cool last:border-b-0">
                    <div className="p-2 bg-red-100/30 text-red-600 rounded-lg">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-[#1f1633] truncate">
                          {log.action}
                        </p>
                        <span className="text-xs text-[#79628c]">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#79628c] mt-0.5">
                        Triggered by <span className="font-semibold text-ink-deep">{log.userName}</span> ({log.userEmail})
                      </p>
                      {log.details && (
                        <pre className="text-[10px] bg-slate-50 p-2 rounded mt-2 overflow-x-auto text-slate-600 max-h-[80px]">
                          {JSON.stringify(log.details)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
