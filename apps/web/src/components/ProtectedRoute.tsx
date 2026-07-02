"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children, requiredRoles = [] }: { children: React.ReactNode, requiredRoles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
        // User is authenticated but doesn't have the right role
        router.push("/unauthorized"); // Or back to their dashboard
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRoles]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-canvas-dark text-on-primary">
        <div className="animate-pulse text-lg font-mono">Loading AFIN...</div>
      </div>
    );
  }

  // If roles are required and user doesn't have it, don't render children while redirecting
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null; 
  }

  return <>{children}</>;
}
