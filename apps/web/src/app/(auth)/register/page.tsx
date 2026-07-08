"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<'INVESTOR' | 'BROKER'>('INVESTOR');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    licenseNumber: "",
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === 'BROKER' && {
          companyName: formData.companyName,
          licenseNumber: formData.licenseNumber,
        }),
      };
      await api.post("/auth/register", payload);
      setIsSuccess(true);
    } catch (err: unknown) {
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
      <div className="min-h-screen w-full flex flex-col bg-[#0a0514] relative text-on-primary">
        {/* Navbar Header */}
        <header className="w-full px-8 py-6 flex items-center z-20 relative">
          <Link href="/">
            <h1 className="font-logo text-white text-[28px] tracking-wider leading-none">
              afin
            </h1>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6 z-10 relative">
          <div className="card-night w-full max-w-md text-center bg-surface-night/60 border border-hairline-violet/30 p-8 rounded-2xl">
            <CheckCircle2 className="w-16 h-16 text-accent-lime mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">Application Submitted</h1>
            <p className="text-on-dark-muted mb-8 text-sm">
              {role === 'BROKER' 
                ? "Your Broker account has been provisioned. Log in to your profile to upload the verifying credentials (ID card & Broker license) for Administrator activation." 
                : "Your investor profile has been provisioned successfully. You can now log in to the platform."}
            </p>
            <Link href="/login" className="btn-inverted w-full inline-flex justify-center py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition-colors">
              Proceed to Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0a0514] relative overflow-hidden py-12 text-on-primary">
      
      {/* Navbar Header */}
      <header className="w-full px-8 py-6 flex items-center z-20 relative">
        <Link href="/">
          <h1 className="font-logo text-white text-[28px] tracking-wider leading-none">
            afin
          </h1>
        </Link>
      </header>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="flex-1 flex items-center justify-center p-6 z-10 relative">
        <div className="card-night w-full max-w-lg relative bg-surface-night/65 border border-hairline-violet/20 p-10 rounded-2xl">
        
        {/* Role Toggle Selector */}
        <div className="flex bg-slate-900/60 p-1 rounded-full border border-white/5 mb-8">
          <button
            type="button"
            onClick={() => setRole('INVESTOR')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-full transition-all ${
              role === 'INVESTOR'
                ? 'bg-white text-black font-bold shadow'
                : 'text-ink/60 hover:text-white'
            }`}
          >
            Investor Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('BROKER')}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-full transition-all ${
              role === 'BROKER'
                ? 'bg-white text-black font-bold shadow'
                : 'text-ink/60 hover:text-white'
            }`}
          >
            Apply as Broker
          </button>
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-display text-[32px] font-bold leading-tight mb-2">
            Onboard <span className="chip-lime ml-2 text-[24px] translate-y-[-2px] inline-block">{role}</span>
          </h1>
          <p className="text-on-dark-muted font-medium text-xs">Create your secure profile on the network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-500/30 rounded-md text-red-400 font-mono text-xs shadow-level-1">
            <span className="font-bold uppercase tracking-console">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="firstName">First Name</label>
              <input id="firstName" type="text" className="w-full mt-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all" value={formData.firstName} onChange={handleChange} required placeholder="Jane" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="lastName">Last Name</label>
              <input id="lastName" type="text" className="w-full mt-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="email">Work Email</label>
            <input id="email" type="email" className="w-full mt-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all" value={formData.email} onChange={handleChange} required placeholder="jane.doe@company.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="password">Secure Password</label>
            <input id="password" type="password" className="w-full mt-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all" value={formData.password} onChange={handleChange} required placeholder="Min 8 characters" />
          </div>

          {/* Conditional Broker-Specific Fields */}
          {role === 'BROKER' && (
            <div className="space-y-5 border-t border-white/5 pt-5 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="companyName">Brokerage Firm Name</label>
                <input id="companyName" type="text" className="w-full mt-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all" value={formData.companyName} onChange={handleChange} required placeholder="Mozambique Capital Partners" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="licenseNumber">Intermediary License Number</label>
                <input id="licenseNumber" type="text" className="w-full mt-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all" value={formData.licenseNumber} onChange={handleChange} required placeholder="BVM-LIC-2026-987" />
              </div>
            </div>
          )}

          <button type="submit" className="btn-inverted w-full mt-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition-colors flex justify-center items-center" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isLoading ? "Submitting Application..." : (role === 'BROKER' ? "Submit Broker Application" : "Create Account")}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-slate-400 text-sm">
            Already registered?{" "}
            <Link href="/login" className="text-white font-bold hover:text-accent-lime transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        </div>
      </main>
    </div>
  );
}
