"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children, requiredRoles = [] }: { children: React.ReactNode, requiredRoles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
        // User is authenticated but doesn't have the right role
        router.push("/unauthorized"); // Or back to their dashboard
      } else if (user && user.role === 'BROKER' && user.status === 'PENDING' && pathname !== '/broker/onboarding') {
        // Force pending brokers to onboarding page
        router.push("/broker/onboarding");
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRoles, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-canvas-dark text-on-primary">
        <div className="animate-pulse text-lg font-mono">Loading AGBX...</div>
      </div>
    );
  }

  // If roles are required and user doesn't have it, don't render children while redirecting
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null; 
  }

  return <>{children}</>;
}
