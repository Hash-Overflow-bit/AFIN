"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  companyName?: string;
  licenseNumber?: string;
  kycStatus?: string;
  investorProfile?: {
    kycStatus: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (data: any, redirect?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          // Fetch latest user data silently in background
          api.get("/auth/me").then(res => {
            if (res.data) {
              localStorage.setItem("user", JSON.stringify(res.data));
              setUser(res.data);
            }
          }).catch(err => console.error("Failed to refresh user", err));
        } catch {
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = (data: { user: User; accessToken: string; refreshToken: string }, redirect: boolean = true) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    
    if (redirect) {
      // Redirect based on role
      if (data.user.role === 'INVESTOR') {
        const kycStatus = data.user.investorProfile?.kycStatus || data.user.kycStatus;
        if (!kycStatus || ['INCOMPLETE', 'PENDING', 'PROFILE_COMPLETE', 'REJECTED'].includes(kycStatus)) {
          router.push("/profile");
        } else {
          // If APPROVED or DOCUMENTS_SUBMITTED, send to dashboard
          router.push("/dashboard");
        }
      } else if (data.user.role === 'BROKER') {
        if (!data.user.kycStatus || ['INCOMPLETE', 'PENDING', 'PROFILE_COMPLETE', 'REJECTED'].includes(data.user.kycStatus)) {
          router.push("/broker/onboarding");
        } else {
          router.push("/broker/dashboard");
        }
      } else {
        router.push("/admin/dashboard");
      }
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/login");
    }
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
