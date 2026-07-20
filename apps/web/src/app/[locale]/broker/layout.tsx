'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import React, { useState } from 'react';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("Navigation");

  if (pathname.includes('/broker/onboarding')) {
    return (
      <ProtectedRoute requiredRoles={['BROKER', 'BROKER_MANAGER', 'BROKER_ANALYST']}>
        {children}
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['BROKER', 'BROKER_MANAGER', 'BROKER_ANALYST', 'ADMIN']}>
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0a0514] text-[#1f1633] dark:text-white font-sans transition-colors duration-200">
        <header className="bg-[#150f23] dark:bg-[#0a0514]/90 dark:backdrop-blur-md border-b border-[#362d59] dark:border-hairline-violet text-on-primary px-[24px] py-[16px] sticky top-0 z-40">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="font-logo text-white text-[24px] tracking-wider leading-[1.25]">AGBX</h1>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/broker/dashboard" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navDashboard')}
                </a>
                <a href="/broker/bonds/create" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navBonds')} (Create)
                </a>
                <a href="/broker/bonds" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navBonds')}
                </a>
                <a href="/broker/orders" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navOrders')}
                </a>
                <a href="/broker/payments" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navPayments')}
                </a>
                <a href="/broker/allocations" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navAllocations')}
                </a>
                <a href="/broker/reports" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {t('navReports')}
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="hidden p-2 rounded-full hover:bg-white/10 text-on-dark-muted transition-colors"
                title={t('switchMode', { mode: theme === 'light' ? 'dark' : 'light' })}
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
              </button>

              <LanguageSwitcher />
              
              <NotificationBell theme="dark" />
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }
                }}
                className="hidden md:block text-[14px] font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 px-4 py-1.5 rounded-full transition-colors"
              >
                {t('btnLogout')}
              </button>

              <button
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-[70px] left-0 right-0 bg-[#150f23] dark:bg-[#0a0514] border-b border-[#362d59] dark:border-hairline-violet shadow-lg p-4 flex flex-col gap-4 z-50">
              <nav className="flex flex-col gap-2">
                {[
                  { name: t('navDashboard'), path: '/broker/dashboard' },
                  { name: t('navBonds') + ' (Create)', path: '/broker/bonds/create' },
                  { name: t('navBonds'), path: '/broker/bonds' },
                  { name: t('navOrders'), path: '/broker/orders' },
                  { name: t('navPayments'), path: '/broker/payments' },
                  { name: t('navAllocations'), path: '/broker/allocations' },
                  { name: t('navReports'), path: '/broker/reports' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium transition-colors ${
                      pathname.startsWith(item.path) && item.path !== '/broker/bonds' || (pathname === '/broker/bonds' && item.path === '/broker/bonds')
                        ? 'bg-accent-violet-deep text-white' 
                        : 'text-on-dark-muted hover:bg-[#1a1130] hover:text-white'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-2 border-t border-[#362d59] dark:border-hairline-violet">
                <div className="px-[12px] py-[10px]">
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium text-on-dark-muted hover:bg-[#1a1130] hover:text-white transition-colors"
                >
                  <span>{t('btnToggleTheme')}</span>
                  {theme === 'light' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }
                  }}
                  className="text-left px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  {t('btnLogout')}
                </button>
              </div>
            </div>
          )}
        </header>
        <main className="max-w-[1440px] mx-auto py-[32px] px-[24px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
