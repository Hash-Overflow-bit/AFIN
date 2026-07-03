"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", formData);
      setIsSuccess(true);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedErr = err as any;
      if (Array.isArray(typedErr.response?.data?.message)) {
        setError(typedErr.response.data.message[0]);
      } else {
        setError(typedErr.response?.data?.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative">
        {/* AFIN Logo */}
        <div className="absolute top-8 left-8 z-20">
          <h1 className="font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-3xl font-bold tracking-wider">
            AFIN
          </h1>
        </div>
        <div className="card-night w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-accent-lime mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold mb-4">Account Created</h1>
          <p className="text-on-dark-muted mb-8">
            Your investor profile has been provisioned successfully. You can now log in to the platform.
          </p>
          <Link href="/login" className="btn-inverted w-full inline-flex">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative overflow-hidden py-12">
      
      {/* AFIN Logo */}
      <div className="absolute top-8 left-8 z-20">
        <h1 className="font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-3xl font-bold tracking-wider">
          AFIN
        </h1>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="card-night w-full max-w-lg relative z-10">
        
        <div className="mb-10 text-center">
          <h1 className="font-display text-[40px] font-bold leading-tight mb-2">
            Onboard <span className="chip-lime ml-2 text-[32px] translate-y-[-2px] inline-block">INVESTOR</span>
          </h1>
          <p className="text-on-dark-muted font-medium">Create your AFIN profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-surface-canvas-dark border border-accent-pink rounded-md text-accent-pink font-mono text-sm shadow-level-1">
            <span className="font-bold uppercase tracking-console">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="firstName">First Name</label>
              <input id="firstName" type="text" className="input-text w-full" value={formData.firstName} onChange={handleChange} required placeholder="Jane" />
            </div>
            <div>
              <label className="input-label" htmlFor="lastName">Last Name</label>
              <input id="lastName" type="text" className="input-text w-full" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="email">Work Email</label>
            <input id="email" type="email" className="input-text w-full" value={formData.email} onChange={handleChange} required placeholder="jane.doe@company.com" />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Secure Password</label>
            <input id="password" type="password" className="input-text w-full" value={formData.password} onChange={handleChange} required placeholder="Min 8 characters, 1 Number, 1 Uppercase" />
          </div>

          <button type="submit" className="btn-inverted w-full mt-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? "Provisioning..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-hairline-violet pt-6">
          <p className="text-on-dark-muted text-sm">
            Already registered?{" "}
            <Link href="/login" className="text-on-primary font-bold hover:text-accent-lime transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
