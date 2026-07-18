'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import React, { useState } from 'react';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("Navigation");
  const pathname = usePathname() || '';

  const navItems = [
    { name: t('navDashboard'), path: '/admin/dashboard' },
    { name: t('navUsers'), path: '/admin/users' },
    { name: t('navSettings'), path: '/admin/settings' },
    { name: t('navLogs'), path: '/admin/logs' },
  ];

  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0a0514] text-[#1f1633] dark:text-white font-sans transition-colors duration-200">
        <header className="bg-[#150f23] dark:bg-[#0a0514]/90 dark:backdrop-blur-md border-b border-[#362d59] dark:border-hairline-violet text-on-primary px-[24px] py-[16px] sticky top-0 z-40">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="font-logo text-white text-[24px] tracking-wider leading-[1.25]">AGBX</h1>
              <span className="text-[11px] bg-red-600/30 text-red-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">ADMIN</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <a key={item.name} href={item.path} className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                  {item.name}
                </a>
              ))}
              
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
                className="text-[14px] font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 px-4 py-1.5 rounded-full transition-colors"
              >
                {t('btnLogout')}
              </button>
            </nav>

            <div className="md:hidden flex items-center space-x-4">
              <NotificationBell theme="dark" />
              <button
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
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
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium transition-colors ${
                      pathname.startsWith(item.path)
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
