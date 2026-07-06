"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Landmark, Briefcase, TrendingUp, Shield, BarChart3, Users, FileText, CheckCircle2, Globe, Building2, Menu, X } from "lucide-react";

// ScrollReveal component triggers the fade-in-up animation when the element enters the viewport
function ScrollReveal({ children, delay = "0s", className = "" }: { children?: ReactNode, delay?: string, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`${className} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div 
      className="min-h-screen w-full relative text-on-primary font-sans flex flex-col overflow-x-hidden"
      style={{ backgroundColor: '#0a0514' }}
    >
      {/* Background Gradient Layer for Hero */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1000px] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 5% 10%, rgba(253, 230, 138, 0.6) 0%, transparent 35%),
            radial-gradient(circle at 35% 45%, rgba(139, 92, 246, 0.8) 0%, transparent 55%),
            radial-gradient(circle at 90% 80%, rgba(15, 23, 42, 0.9) 0%, transparent 60%)
          `
        }}
      />

      {/* Navbar */}
      <ScrollReveal className="w-full flex items-center justify-between px-8 py-6 relative z-50">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/">
            <h1 className="font-logo text-white text-3xl font-bold tracking-wider">
              afin
            </h1>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-primary/90">
            <Link href="#about" className="hover:text-accent-lime transition-colors">About</Link>
            <Link href="#how-it-works" className="hover:text-accent-lime transition-colors">How it Works</Link>
            <Link href="#company" className="hover:text-accent-lime transition-colors">Company</Link>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium hover:text-accent-lime transition-colors">
            Log In
          </Link>
          <Link 
            href="/register" 
            className="text-sm font-medium bg-surface-night text-on-primary border border-hairline-violet px-6 py-2.5 rounded-full hover:bg-accent-violet-deep hover:border-accent-violet transition-all shadow-[0_0_15px_rgba(106,95,193,0.3)]"
          >
            Join Now
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden p-2 text-on-primary/90 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </ScrollReveal>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 right-0 bg-[#0a0514]/95 backdrop-blur-xl border-b border-white/10 z-40 px-8 py-6 flex flex-col gap-6 shadow-level-4 animate-fade-in-up">
          <Link href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">About</Link>
          <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">How it Works</Link>
          <Link href="#company" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">Company</Link>
          
          <div className="w-full h-px bg-white/10 my-2" />
          
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">
            Log In
          </Link>
          <Link 
            href="/register" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-medium bg-surface-night text-on-primary border border-hairline-violet px-6 py-3 rounded-full text-center hover:bg-accent-violet-deep transition-all"
          >
            Join Now
          </Link>
        </div>
      )}

      {/* Main Hero Section */}
      <main className="w-full max-w-[1400px] mx-auto px-8 flex flex-col lg:flex-row items-center justify-between relative z-10 pt-20 pb-28">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-16 lg:mb-0 mt-8">
          <ScrollReveal delay="0.1s">
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
              High-Yield<br />
              Government Bonds.<br />
              <span className="text-on-primary/90">
                Now One<br />Click Away!
              </span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay="0.3s">
            <div className="flex items-center gap-4 relative">
              <Link 
                href="/register" 
                className="bg-surface-night border border-hairline-violet text-on-primary rounded-full px-8 py-3.5 font-bold uppercase tracking-console text-sm inline-flex items-center group hover:bg-accent-violet-deep transition-colors"
              >
                Start Investing <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Graphic (Orbiting Network) */}
        <ScrollReveal delay="0.2s" className="w-full lg:w-1/2 h-[400px] md:h-[500px] lg:h-[700px] relative flex items-center justify-center overflow-hidden lg:overflow-visible">
          <div className="relative flex items-center justify-center w-full h-full scale-[0.5] sm:scale-75 md:scale-90 lg:scale-100 origin-center">
            {/* Central Stat */}
            <div className="absolute z-20 text-center">
              <h2 className="font-display text-5xl lg:text-6xl font-bold mb-1">15B+</h2>
              <p className="text-sm font-medium text-on-primary/70 uppercase tracking-widest">MZN Traded</p>
            </div>

            {/* Concentric Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[200px] h-[200px] rounded-full border border-white/10 absolute animate-[spin_40s_linear_infinite]" />
              <div className="w-[350px] h-[350px] rounded-full border border-white/10 absolute animate-[spin_60s_linear_infinite_reverse]" />
              <div className="w-[500px] h-[500px] rounded-full border border-white/10 absolute animate-[spin_80s_linear_infinite]" />
              <div className="w-[650px] h-[650px] rounded-full border border-white/5 absolute animate-[spin_100s_linear_infinite_reverse]" />
            </div>

            {/* Floating Nodes (Orbiting on the rings) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-[200px] h-[200px] animate-[spin_40s_linear_infinite]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-surface-night border border-hairline-violet rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(106,95,193,0.5)] -animate-[spin_40s_linear_infinite]">
                  <Landmark className="w-6 h-6 text-accent-lime" />
                </div>
              </div>

              <div className="absolute w-[350px] h-[350px] animate-[spin_60s_linear_infinite_reverse]">
                <div className="absolute top-10 right-10 w-10 h-10 bg-[#1a1325] border border-accent-pink/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(250,127,170,0.3)] -animate-[spin_60s_linear_infinite_reverse]">
                  <Briefcase className="w-5 h-5 text-accent-pink" />
                </div>
                <div className="absolute bottom-10 left-10 w-12 h-12 bg-[#1a1325] border border-white/20 rounded-xl flex items-center justify-center -animate-[spin_60s_linear_infinite_reverse]">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="absolute w-[500px] h-[500px] animate-[spin_80s_linear_infinite]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-surface-night border border-accent-lime/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(194,239,78,0.2)] -animate-[spin_80s_linear_infinite]">
                  <TrendingUp className="w-7 h-7 text-accent-lime" />
                </div>
                <div className="absolute right-10 bottom-20 w-10 h-10 bg-[#1a1325] border border-white/10 rounded-xl flex items-center justify-center -animate-[spin_80s_linear_infinite]">
                  <Shield className="w-5 h-5 text-accent-violet" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Partners Marquee */}
      <ScrollReveal delay="0.2s" className="w-full relative z-20 py-6 border-y border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="flex w-[200%] animate-marquee">
          {/* First set of partners */}
          <div className="flex w-1/2 justify-around items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Shield className="w-4 h-4 md:w-6 md:h-6" /> Ministry of Economy</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Landmark className="w-4 h-4 md:w-6 md:h-6" /> Mozambique Stock Exchange</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Briefcase className="w-4 h-4 md:w-6 md:h-6" /> Trusted Broker Network</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><BarChart3 className="w-4 h-4 md:w-6 md:h-6" /> Central Bank</div>
          </div>
          {/* Duplicated set for seamless loop */}
          <div className="flex w-1/2 justify-around items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Shield className="w-4 h-4 md:w-6 md:h-6" /> Ministry of Economy</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Landmark className="w-4 h-4 md:w-6 md:h-6" /> Mozambique Stock Exchange</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Briefcase className="w-4 h-4 md:w-6 md:h-6" /> Trusted Broker Network</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><BarChart3 className="w-4 h-4 md:w-6 md:h-6" /> Central Bank</div>
          </div>
        </div>
      </ScrollReveal>

      {/* About Section */}
      <section id="about" className="w-full py-24 md:py-32 relative z-20 bg-white overflow-hidden text-[#1f1633]">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row gap-16 items-center">
          <ScrollReveal delay="0.1s" className="w-full md:w-1/2">
            <h2 className="text-accent-violet-deep font-bold tracking-widest uppercase text-sm mb-4">About afin</h2>
            <h3 className="font-display text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-[#1f1633]">
              Democratizing Access to Sovereign Debt
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The African Fixed Income Network (AFIN) is a secure, institutional-grade platform designed to connect retail and institutional investors directly with high-yield government bonds in Mozambique.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We eliminate traditional barriers to entry by providing a transparent, fully digital brokerage experience where you can securely verify your identity, browse active bond issuances, and track your portfolio&apos;s performance in real time.
            </p>
          </ScrollReveal>
          
          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ScrollReveal delay="0.3s" className="h-full">
              <div className="bg-[#f9fafb] p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                <Shield className="w-12 h-12 text-accent-violet mb-6" />
                <h4 className="font-bold text-2xl mb-3 text-[#1f1633]">Secure & Regulated</h4>
                <p className="text-gray-600 leading-relaxed">Strict KYC/AML compliance ensuring bank-grade security for all transactions.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay="0.5s" className="h-full">
              <div className="bg-[#f9fafb] p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                <TrendingUp className="w-12 h-12 text-accent-violet-mid mb-6" />
                <h4 className="font-bold text-2xl mb-3 text-[#1f1633]">High Yield Returns</h4>
                <p className="text-gray-600 leading-relaxed">Direct access to competitive sovereign debt instruments and reliable coupon payments.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="w-full py-24 md:py-32 relative z-20 bg-[#f9fafb] text-[#1f1633] border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <ScrollReveal delay="0.1s">
            <h2 className="text-accent-violet-deep font-bold tracking-widest uppercase text-sm mb-4">How It Works</h2>
            <h3 className="font-display text-5xl lg:text-6xl font-extrabold mb-16 md:mb-24 text-[#1f1633]">
              Start Investing in 3 Simple Steps
            </h3>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative">
            {/* Connecting line for desktop */}
            <ScrollReveal delay="0.4s" className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            
            <ScrollReveal delay="0.2s" className="relative flex flex-col items-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center z-10 mb-8 shadow-sm group-hover:shadow-md transition-all relative border border-gray-100 group-hover:scale-105 duration-300">
                <Users className="w-10 h-10 text-accent-violet" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-violet text-white font-bold rounded-full flex items-center justify-center shadow-sm">1</div>
              </div>
              <h4 className="font-bold text-2xl mb-4">Create Profile</h4>
              <p className="text-gray-600 text-center max-w-[280px] leading-relaxed">Register an account and quickly verify your identity using our seamless KYC workflow.</p>
            </ScrollReveal>

            <ScrollReveal delay="0.4s" className="relative flex flex-col items-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center z-10 mb-8 shadow-sm group-hover:shadow-md transition-all relative border border-gray-100 group-hover:scale-105 duration-300">
                <FileText className="w-10 h-10 text-accent-violet-mid" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-violet-mid text-white font-bold rounded-full flex items-center justify-center shadow-sm">2</div>
              </div>
              <h4 className="font-bold text-2xl mb-4">Browse Bonds</h4>
              <p className="text-gray-600 text-center max-w-[280px] leading-relaxed">Explore open government bond offerings, review yield rates, and place your investment orders.</p>
            </ScrollReveal>

            <ScrollReveal delay="0.6s" className="relative flex flex-col items-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center z-10 mb-8 shadow-sm group-hover:shadow-md transition-all relative border border-gray-100 group-hover:scale-105 duration-300">
                <CheckCircle2 className="w-10 h-10 text-accent-violet-deep" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-violet-deep text-white font-bold rounded-full flex items-center justify-center shadow-sm">3</div>
              </div>
              <h4 className="font-bold text-2xl mb-4">Earn Returns</h4>
              <p className="text-gray-600 text-center max-w-[280px] leading-relaxed">Upload payment proof, get your bonds allocated, and track your scheduled coupon payouts.</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Company Section - Pinterest Masonry Layout */}
      <section id="company" className="w-full py-24 md:py-32 relative z-20 bg-surface-night border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8">
          <ScrollReveal delay="0.1s" className="text-center mb-16">
            <h2 className="text-accent-violet font-bold tracking-widest uppercase text-sm mb-4">Our Company</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-extrabold mb-6">Building the Financial Infrastructure of Tomorrow</h3>
            <p className="text-on-dark-muted text-lg leading-relaxed max-w-3xl mx-auto">
              AFIN is backed by a consortium of leading financial technologists, economists, and legal experts dedicated to bridging the gap between national treasuries and everyday investors.
            </p>
          </ScrollReveal>

          {/* Pinterest-style Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <ScrollReveal delay="0.2s" className="break-inside-avoid">
              <div className="bg-[#1a1325] p-8 rounded-3xl border border-white/5 shadow-level-1 hover:-translate-y-1 transition-transform">
                <Globe className="w-12 h-12 text-accent-lime mb-6" />
                <h4 className="font-bold text-2xl mb-3">Global Vision</h4>
                <p className="text-on-dark-muted leading-relaxed">Expanding digital financial inclusion across the continent and building bridges to international capital markets.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay="0.3s" className="break-inside-avoid">
              <div className="bg-gradient-to-br from-accent-violet-deep to-[#1a1325] p-8 rounded-3xl border border-white/5 shadow-level-1 hover:-translate-y-1 transition-transform text-center py-16">
                <Building2 className="w-16 h-16 text-white mb-6 mx-auto opacity-90" />
                <h4 className="font-bold text-2xl mb-3">Institutional Grade</h4>
                <p className="text-white/80 leading-relaxed">Partnered with top-tier brokers and regulated financial entities.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay="0.4s" className="break-inside-avoid">
              <div className="bg-[#1a1325] p-8 rounded-3xl border border-white/5 shadow-level-1 hover:-translate-y-1 transition-transform">
                <Shield className="w-10 h-10 text-accent-pink mb-4" />
                <h4 className="font-bold text-xl mb-2">Secure & Compliant</h4>
                <p className="text-on-dark-muted text-sm leading-relaxed">Adhering to the strictest global regulatory standards for your peace of mind.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay="0.5s" className="break-inside-avoid">
              <div className="bg-[#1a1325] p-8 rounded-3xl border border-white/5 shadow-level-1 hover:-translate-y-1 transition-transform py-12">
                <Users className="w-12 h-12 text-accent-violet mb-6" />
                <h4 className="font-bold text-2xl mb-3">Dedicated Team</h4>
                <p className="text-on-dark-muted leading-relaxed">Led by industry veterans with deep expertise in fintech, regulatory compliance, and emerging market debt.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay="0.6s" className="break-inside-avoid">
              <div className="bg-accent-lime p-8 rounded-3xl border border-white/5 shadow-level-1 hover:-translate-y-1 transition-transform text-ink-deep">
                <TrendingUp className="w-12 h-12 text-[#150f23] mb-6" />
                <h4 className="font-bold text-2xl mb-3">Fintech Innovation</h4>
                <p className="text-[#150f23]/80 font-medium leading-relaxed">Pioneering digital-first solutions for modern sovereign debt marketplaces.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay="0.7s" className="break-inside-avoid">
              <div className="bg-[#1a1325] p-8 rounded-3xl border border-white/5 shadow-level-1 hover:-translate-y-1 transition-transform">
                <Briefcase className="w-10 h-10 text-white mb-4" />
                <h4 className="font-bold text-xl mb-2">B2B Network</h4>
                <p className="text-on-dark-muted text-sm leading-relaxed">Empowering brokers with a complete white-label digital infrastructure.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer - Massive Brand Text Layout */}
      <footer className="w-full bg-[#05020a] pt-32 pb-8 border-t border-white/5 relative z-20 overflow-hidden">
        {/* Subtle Radial Gradients for Background Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-[20%] w-[500px] h-[500px] bg-[#fa7faa]/5 rounded-full blur-[120px] -translate-y-1/2 mix-blend-screen" />
          <div className="absolute top-1/2 right-[20%] w-[500px] h-[500px] bg-[#6a5fc1]/10 rounded-full blur-[120px] -translate-y-1/2 mix-blend-screen" />
        </div>

        <div className="max-w-[1400px] mx-auto px-8 relative z-10 flex flex-col items-center">
          {/* Massive Logo Text */}
          <div className="w-full flex justify-center mb-24 select-none relative z-20">
            <h2 className="font-logo font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:3px_rgba(255,255,255,0.3)] hover:[-webkit-text-stroke:3px_rgba(255,255,255,0.8)] transition-all duration-700 cursor-default" style={{ fontSize: 'clamp(80px, 22vw, 350px)' }}>
              afin
            </h2>
          </div>

          {/* Minimal Bottom Bar */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center text-[#8e8e8e] text-sm font-medium gap-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
              <span>&copy; {new Date().getFullYear()} AFIN. All rights reserved.</span>
              <a href="https://www.upwork.com/freelancers/~018cb6b2be97dd2433" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors opacity-50 hover:opacity-100 hidden md:block">Developed by Hash-overflow</a>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
