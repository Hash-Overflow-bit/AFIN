"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data);
    } catch (err: unknown) {
      const typedErr = err as { response?: { data?: { message?: string } } };
      setError(
        typedErr.response?.data?.message || "Invalid email or password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0a0514] relative overflow-hidden text-on-primary">
      {/* Navbar Header */}
      <header className="w-full px-8 py-6 flex items-center z-20 relative">
        <Link href="/">
          <h1 className="font-logo text-white text-[28px] tracking-wider leading-none">
            AGBX
          </h1>
        </Link>
      </header>

      {/* Decorative Starfield Texture - Faint background element */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <main className="flex-1 flex items-center justify-center p-6 z-10 relative">
        <div className="card-night w-full max-w-md relative bg-surface-night/65 border border-hairline-violet/20 p-10 rounded-2xl">
        <div className="mb-10 text-center">
          <h1 className="font-display text-[40px] font-bold leading-tight mb-2">
            Sign In{" "}
            <span className="chip-lime ml-2 text-[32px] translate-y-[-2px] inline-block">
              CONSOLE
            </span>
          </h1>
          <p className="text-on-dark-muted font-medium">
            Access your AGBX dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-500/30 rounded-md text-red-400 font-mono text-xs shadow-level-1">
            <span className="font-bold uppercase tracking-console">Error:</span>{" "}
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5 flex justify-between"
              htmlFor="password"
            >
              <span>Password</span>
              <a
                href="#"
                className="text-accent-violet hover:text-accent-lime transition-colors text-xs font-normal"
              >
                Forgot?
              </a>
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-sm font-medium transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-inverted w-full mt-2 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            {isLoading ? "Authenticating..." : "Login to Workspace"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-hairline-violet pt-6">
          <p className="text-on-dark-muted text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-on-primary font-bold hover:text-accent-lime transition-colors border-b border-transparent hover:border-accent-lime"
            >
              Request access
            </Link>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}
