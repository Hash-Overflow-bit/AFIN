'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['INVESTOR']}>
      <div className="min-h-screen bg-surface-canvas-light text-ink">
        {/* We can add a sidebar or navbar here later according to DESIGN.md */}
        <header className="bg-surface-canvas-light border-b border-hairline-cloud px-[24px] py-[16px]">
          <div className="max-w-[1152px] mx-auto flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-ink leading-[1.25]">AFIN Investor Portal</h1>
            <button 
              onClick={logout}
              className="text-[14px] font-semibold text-ink/70 hover:text-accent-violet transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="max-w-[1152px] mx-auto py-[32px] px-[24px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
