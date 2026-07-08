'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import React from 'react';
import { NotificationBell } from '@/components/layout/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <div className="min-h-screen bg-surface-canvas-light text-ink">
        <header className="bg-surface-night text-on-primary px-[24px] py-[16px] shadow-level-1">
          <div className="max-w-[1152px] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="font-logo text-white text-[24px] tracking-wider leading-[1.25]">afin</h1>
              <span className="text-[11px] bg-red-600/30 text-red-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">ADMIN</span>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/admin/dashboard" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Dashboard
              </a>
              <a href="/admin/users" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Users
              </a>
              <a href="/admin/settings" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Settings
              </a>
              <a href="/admin/logs" className="text-[14px] font-medium hover:text-accent-lime transition-colors">
                Audit Logs
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
