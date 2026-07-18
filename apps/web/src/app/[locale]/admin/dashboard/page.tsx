'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { KPICard } from '@/components/dashboard/KPICard';
import { Users, ShieldAlert, Settings, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const t = useTranslations("AdminDashboard");
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
          <h3 className="text-[#1f1633] font-semibold text-lg mb-2">{t('errAccessDenied')}</h3>
          <p className="text-[#79628c] text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            {t('btnRelogin')}
          </button>
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
            {t('title')}
          </h1>
          <p className="text-[#79628c] dark:text-on-dark-muted mt-2 text-sm">
            Overview of users, settings configurations, and security audit log traces.
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 border border-[#e5e7eb] dark:border-[#362d59] hover:bg-slate-50 dark:hover:bg-[#1a1130] rounded-lg text-sm font-semibold transition-colors bg-white dark:bg-ink-deep text-[#1f1633] dark:text-white shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title={t('kpiTotalUsers')} 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          tooltip="Total accounts registered including investors, brokers, and administrators."
        />
        <KPICard 
          title={t('kpiInvestors')} 
          value={stats?.investors || 0} 
          icon={Users} 
          tooltip="Individual and institutional investors registered in the system."
        />
        <KPICard 
          title={t('kpiBrokers')} 
          value={stats?.brokers || 0} 
          icon={FileSpreadsheet} 
          tooltip="Financial intermediary roles managing subscriptions, KYC, and payments."
        />
        <KPICard 
          title={t('kpiSuspended')} 
          value={stats?.suspended || 0} 
          icon={ShieldAlert} 
          tooltip="Accounts currently suspended or deactivated from logging in."
        />
      </div>

      {/* Grid for Quick Actions and Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (65%) - Security Logs Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-ink-deep rounded-2xl border border-[#e5e7eb] dark:border-hairline-violet p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-[#1f1633] dark:text-white tracking-tight">{t('recentAudits')}</h3>
              <a href="/admin/logs" className="text-sm font-bold tracking-wide text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 uppercase transition-colors">
                {t('viewAllLogs')} &rarr;
              </a>
            </div>
            
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#79628c] dark:text-on-dark-muted space-y-3">
                <ShieldAlert className="w-10 h-10 text-[#79628c]/30 dark:text-white/10" />
                <p className="text-sm font-medium">{t('noLogs')}</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-[#e5e7eb] dark:divide-[#362d59] flex-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 py-4 hover:bg-slate-50 dark:hover:bg-[#1a1130]/50 transition-colors px-2 -mx-2 rounded-lg">
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex-shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-1">
                        <p className="text-[14px] font-bold text-[#1f1633] dark:text-white truncate tracking-tight">
                          {log.action === 'ADMIN_USER_UPDATED' ? t('actionUserUpdated') :
                           log.action === 'ADMIN_USER_CREATED' ? t('actionUserCreated') :
                           log.action === 'ADMIN_SETTINGS_UPDATED' ? t('actionSettingsUpdated') :
                           log.action === 'ADMIN_LOGIN' ? t('actionLogin') :
                           log.action}
                        </p>
                        <span className="text-[11px] font-semibold text-[#79628c] dark:text-on-dark-muted tracking-wider uppercase bg-slate-100 dark:bg-[#1a1130] px-2 py-0.5 rounded">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#79628c] dark:text-on-dark-muted mt-1 font-medium">
                        {t('triggeredBy')} <span className="font-bold text-[#1f1633] dark:text-white">{log.userName}</span> <span className="opacity-75">({log.userEmail})</span>
                      </p>
                      {log.details && (
                        <div className="mt-3">
                          <pre className="text-[11px] bg-slate-50 dark:bg-[#0a0514] border border-[#e5e7eb] dark:border-[#362d59] p-3 rounded-lg overflow-x-auto text-[#1f1633] dark:text-on-dark-muted font-mono shadow-inner max-h-[100px] leading-relaxed">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (35%) - Quick Tools */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-ink-deep rounded-2xl border border-[#e5e7eb] dark:border-hairline-violet p-6 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#1f1633] dark:text-white mb-5 tracking-tight">{t('quickTools')}</h3>
            <div className="space-y-3">
              <Tooltip 
                position="left"
                className="w-full"
                content="Manage system actors directory: edit user profiles, promote/demote roles, or suspend user access to secure the network."
              >
                <a 
                  href="/admin/users" 
                  className="group flex items-center space-x-4 p-4 rounded-xl border border-[#e5e7eb] dark:border-[#362d59] hover:border-[#6a5fc1] dark:hover:border-accent-lime hover:bg-[#f8f7fb] dark:hover:bg-[#1a1130] transition-all w-full shadow-sm hover:shadow"
                >
                  <div className="p-2.5 bg-slate-100 dark:bg-[#1f1735] group-hover:bg-[#6a5fc1]/10 dark:group-hover:bg-accent-lime/10 rounded-lg transition-colors">
                    <Users className="w-5 h-5 text-[#6a5fc1] dark:text-accent-lime" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[14px] text-[#1f1633] dark:text-white group-hover:text-[#6a5fc1] dark:group-hover:text-accent-lime transition-colors">{t('toolUsers')}</div>
                    <div className="text-[12px] text-[#79628c] dark:text-on-dark-muted mt-0.5 leading-snug">{t('toolUsersDesc')}</div>
                  </div>
                </a>
              </Tooltip>

              <Tooltip 
                position="left"
                className="w-full"
                content="Configure operational variables: toggle platform maintenance modes, global subscription ceilings, or mock KYC validation."
              >
                <a 
                  href="/admin/settings" 
                  className="group flex items-center space-x-4 p-4 rounded-xl border border-[#e5e7eb] dark:border-[#362d59] hover:border-[#6a5fc1] dark:hover:border-accent-lime hover:bg-[#f8f7fb] dark:hover:bg-[#1a1130] transition-all w-full shadow-sm hover:shadow"
                >
                  <div className="p-2.5 bg-slate-100 dark:bg-[#1f1735] group-hover:bg-[#6a5fc1]/10 dark:group-hover:bg-accent-lime/10 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-[#6a5fc1] dark:text-accent-lime" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[14px] text-[#1f1633] dark:text-white group-hover:text-[#6a5fc1] dark:group-hover:text-accent-lime transition-colors">{t('toolSettings')}</div>
                    <div className="text-[12px] text-[#79628c] dark:text-on-dark-muted mt-0.5 leading-snug">{t('toolSettingsDesc')}</div>
                  </div>
                </a>
              </Tooltip>

              <Tooltip 
                position="left"
                className="w-full"
                content="Inspect immutable activity trails: audit administrative changes, user creations, setting overrides, and details delta logs."
              >
                <a 
                  href="/admin/logs" 
                  className="group flex items-center space-x-4 p-4 rounded-xl border border-[#e5e7eb] dark:border-[#362d59] hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all w-full shadow-sm hover:shadow"
                >
                  <div className="p-2.5 bg-slate-100 dark:bg-[#1f1735] group-hover:bg-red-100 dark:group-hover:bg-red-900/30 rounded-lg transition-colors">
                    <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[14px] text-[#1f1633] dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{t('toolLogs')}</div>
                    <div className="text-[12px] text-[#79628c] dark:text-on-dark-muted mt-0.5 leading-snug">{t('toolLogsDesc')}</div>
                  </div>
                </a>
              </Tooltip>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
