'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import React from 'react';

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['BROKER', 'ADMIN']}>
      <div className="min-h-screen bg-surface-canvas-light text-ink">
        <header className="bg-surface-night text-on-primary px-[24px] py-[16px] shadow-level-1">
          <div className="max-w-[1152px] mx-auto flex items-center justify-between">
            <h1 className="text-[20px] font-semibold leading-[1.25]">AFIN Broker Portal</h1>
            <nav className="flex space-x-6">
              <a href="/broker/dashboard" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                KYC Queue
              </a>
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
