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
    <div className="min-h-screen w-full flex flex-col bg-white relative overflow-hidden">
      {/* Navbar Header */}
      <header className="w-full px-8 py-6 flex items-center z-20 relative">
        <Link href="/">
          <h1 className="font-logo text-[#1f1633] text-[28px] tracking-wider leading-none">
            afin
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
        <div className="card-night w-full max-w-md relative">
        <div className="mb-10 text-center">
          <h1 className="font-display text-[40px] font-bold leading-tight mb-2">
            Sign In{" "}
            <span className="chip-lime ml-2 text-[32px] translate-y-[-2px] inline-block">
              CONSOLE
            </span>
          </h1>
          <p className="text-on-dark-muted font-medium">
            Access your AFIN dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-surface-night border border-hairline-violet rounded-md text-accent-pink font-mono text-sm shadow-level-1">
            <span className="font-bold uppercase tracking-console">Error:</span>{" "}
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="input-label text-on-primary" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input-text w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              className="input-label text-on-primary flex justify-between"
              htmlFor="password"
            >
              <span>Password</span>
              <a
                href="#"
                className="text-accent-violet hover:text-accent-lime transition-colors text-sm font-normal"
              >
                Forgot?
              </a>
            </label>
            <input
              id="password"
              type="password"
              className="input-text w-full"
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
