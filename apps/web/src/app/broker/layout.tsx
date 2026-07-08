'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import React from 'react';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { usePathname } from 'next/navigation';

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/broker/onboarding') {
    return (
      <ProtectedRoute requiredRoles={['BROKER']}>
        {children}
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['BROKER', 'ADMIN']}>
      <div className="min-h-screen bg-surface-canvas-light text-ink">
        <header className="bg-surface-night text-on-primary px-[24px] py-[16px] shadow-level-1">
          <div className="max-w-[1152px] mx-auto flex items-center justify-between">
            <h1 className="font-logo text-white text-[24px] tracking-wider leading-[1.25]">afin</h1>
            <nav className="flex items-center space-x-6">
              <a href="/broker/dashboard" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                KYC Queue
              </a>
              <a href="/broker/bonds/create" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Create Bond
              </a>
              <a href="/broker/bonds" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Bonds
              </a>
              <a href="/broker/orders" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Orders
              </a>
              <a href="/broker/payments" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Payments
              </a>
              <a href="/broker/allocations" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Allocations
              </a>
              <a href="/broker/reports" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Reports
              </a>
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
                Logout
              </button>
            </nav>
          </div>
        </header>
        <main className="max-w-[1152px] mx-auto py-[32px] px-[24px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
