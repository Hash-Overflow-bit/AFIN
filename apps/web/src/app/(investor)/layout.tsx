'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'My Orders', path: '/orders' },
  ];

  return (
    <ProtectedRoute requiredRoles={['INVESTOR']}>
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0a0514] text-[#1f1633] dark:text-white font-sans transition-colors duration-200">
        <header className="bg-[#ffffff] dark:bg-[#0a0514]/90 dark:backdrop-blur-md border-b border-[#e5e7eb] dark:border-hairline-violet px-[24px] py-[16px] sticky top-0 z-40">
          <div className="max-w-[1152px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                <h1 className="font-logo text-[#1f1633] dark:text-white text-[24px] tracking-wider leading-[1.25]">AGBX</h1>
              </Link>
              
              <nav className="hidden md:flex gap-1">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`px-[12px] py-[6px] rounded-[6px] text-[14px] font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#f0f0f0] dark:bg-accent-violet-deep text-[#1f1633] dark:text-white' 
                          : 'text-[#79628c] hover:bg-[#f9fafb] dark:hover:bg-[#1a1130] hover:text-[#1f1633] dark:hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-6">
               <button
                 onClick={toggleTheme}
                 className="hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1a1130] text-[#79628c] dark:text-on-dark-muted transition-colors"
                 title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
               >
                 {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
               </button>
              <NotificationBell theme={theme === 'dark' ? 'dark' : 'light'} />
              <button 
                onClick={logout}
                className="hidden md:block text-[14px] font-semibold text-[#79628c] hover:text-[#422082] dark:hover:text-accent-lime transition-colors"
              >
                Logout
              </button>
              
              <button
                className="md:hidden p-2 text-[#79628c] dark:text-white hover:bg-slate-100 dark:hover:bg-[#1a1130] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-[70px] left-0 right-0 bg-[#ffffff] dark:bg-[#0a0514] border-b border-[#e5e7eb] dark:border-hairline-violet shadow-lg p-4 flex flex-col gap-4 z-50">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#f0f0f0] dark:bg-accent-violet-deep text-[#1f1633] dark:text-white' 
                          : 'text-[#79628c] hover:bg-[#f9fafb] dark:hover:bg-[#1a1130] hover:text-[#1f1633] dark:hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e5e7eb] dark:border-hairline-violet">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium text-[#79628c] hover:bg-[#f9fafb] dark:hover:bg-[#1a1130] hover:text-[#1f1633] dark:hover:text-white transition-colors"
                >
                  <span>Toggle Theme</span>
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-left px-[12px] py-[10px] rounded-[6px] text-[16px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>
        <main className="max-w-[1152px] mx-auto py-[32px] px-[24px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
