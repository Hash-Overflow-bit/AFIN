'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/layout/NotificationBell';

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'My Orders', path: '/orders' },
  ];

  return (
    <ProtectedRoute requiredRoles={['INVESTOR']}>
      <div className="min-h-screen bg-[#ffffff] text-[#1f1633] font-sans">
        <header className="bg-[#ffffff] border-b border-[#e5e7eb] px-[24px] py-[16px] sticky top-0 z-40">
          <div className="max-w-[1152px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="font-logo text-[#1f1633] text-[24px] tracking-wider leading-[1.25]">afin</h1>
              
              <nav className="hidden md:flex gap-1">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`px-[12px] py-[6px] rounded-[6px] text-[14px] font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#f0f0f0] text-[#1f1633]' 
                          : 'text-[#79628c] hover:bg-[#f9fafb] hover:text-[#1f1633]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-6">
              <NotificationBell />
              <button 
                onClick={logout}
                className="text-[14px] font-semibold text-[#79628c] hover:text-[#422082] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-[1152px] mx-auto py-[32px] px-[24px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
