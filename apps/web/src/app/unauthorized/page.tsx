'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGoHome = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'INVESTOR') {
      router.push('/dashboard');
    } else if (user.role === 'BROKER') {
      router.push('/broker/dashboard');
    } else if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas-dark text-on-primary flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ backgroundColor: '#0a0514' }}>
      {/* Background radial gradient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-md w-full text-center relative z-10 space-y-8 bg-surface-night/45 p-10 rounded-2xl border border-red-500/20 backdrop-blur-xl shadow-level-4">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 ring-4 ring-red-500/5 animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">Access Denied</h1>
          <p className="text-ink/70 text-[14px]">
            You do not have the required permissions to view this section of the platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-sm bg-red-600 hover:bg-red-700 text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            Go to My Dashboard
          </button>
          
          <button
            onClick={logout}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-sm border border-white/10 hover:bg-white/5 text-ink/80 hover:text-white transition-all"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
