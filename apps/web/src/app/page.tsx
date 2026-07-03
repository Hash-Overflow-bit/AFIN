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
            <h1 className="font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-3xl font-bold tracking-wider">
              AFIN
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
      <section id="about" className="w-full py-24 md:py-32 relative z-20 bg-surface-night overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row gap-16 items-center">
          <ScrollReveal delay="0.1s" className="w-full md:w-1/2">
            <h2 className="text-accent-lime font-bold tracking-widest uppercase text-sm mb-4">About AFIN</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-tight">Democratizing Access to Sovereign Debt</h3>
            <p className="text-on-dark-muted text-lg leading-relaxed mb-6">
              The African Fixed Income Network (AFIN) is a secure, institutional-grade platform designed to connect retail and institutional investors directly with high-yield government bonds in Mozambique.
            </p>
            <p className="text-on-dark-muted text-lg leading-relaxed">
              We eliminate traditional barriers to entry by providing a transparent, fully digital brokerage experience where you can securely verify your identity, browse active bond issuances, and track your portfolio&apos;s performance in real time.
            </p>
          </ScrollReveal>
          
          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ScrollReveal delay="0.3s">
              <div className="bg-[#1a1325] p-8 rounded-2xl border border-white/5 shadow-level-1 h-full">
                <Shield className="w-10 h-10 text-accent-violet mb-4" />
                <h4 className="font-bold text-xl mb-2">Secure & Regulated</h4>
                <p className="text-on-dark-muted text-sm leading-relaxed">Strict KYC/AML compliance ensuring bank-grade security for all transactions.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay="0.5s">
              <div className="bg-[#1a1325] p-8 rounded-2xl border border-white/5 shadow-level-1 h-full">
                <TrendingUp className="w-10 h-10 text-accent-lime mb-4" />
                <h4 className="font-bold text-xl mb-2">High Yield Returns</h4>
                <p className="text-on-dark-muted text-sm leading-relaxed">Direct access to competitive sovereign debt instruments and reliable coupon payments.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="w-full py-24 md:py-32 relative z-20 bg-[#0a0514]">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <ScrollReveal delay="0.1s">
            <h2 className="text-accent-pink font-bold tracking-widest uppercase text-sm mb-4">How It Works</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-16 md:mb-24">Start Investing in 3 Simple Steps</h3>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative">
            {/* Connecting line for desktop */}
            <ScrollReveal delay="0.4s" className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-accent-violet/10 via-accent-violet to-accent-pink/10" />
            
            <ScrollReveal delay="0.2s" className="relative flex flex-col items-center">
              <div className="w-24 h-24 bg-surface-night rounded-full border border-accent-violet flex items-center justify-center z-10 mb-8 shadow-level-2 relative">
                <Users className="w-10 h-10 text-accent-violet" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-violet text-white font-bold rounded-full flex items-center justify-center border-4 border-[#0a0514]">1</div>
              </div>
              <h4 className="font-bold text-2xl mb-4">Create Profile</h4>
              <p className="text-on-dark-muted text-center max-w-[280px] leading-relaxed">Register an account and quickly verify your identity using our seamless KYC workflow.</p>
            </ScrollReveal>

            <ScrollReveal delay="0.4s" className="relative flex flex-col items-center">
              <div className="w-24 h-24 bg-surface-night rounded-full border border-accent-lime flex items-center justify-center z-10 mb-8 shadow-level-2 relative">
                <FileText className="w-10 h-10 text-accent-lime" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-lime text-ink-deep font-bold rounded-full flex items-center justify-center border-4 border-[#0a0514]">2</div>
              </div>
              <h4 className="font-bold text-2xl mb-4">Browse Bonds</h4>
              <p className="text-on-dark-muted text-center max-w-[280px] leading-relaxed">Explore open government bond offerings, review yield rates, and place your investment orders.</p>
            </ScrollReveal>

            <ScrollReveal delay="0.6s" className="relative flex flex-col items-center">
              <div className="w-24 h-24 bg-surface-night rounded-full border border-accent-pink flex items-center justify-center z-10 mb-8 shadow-level-2 relative">
                <CheckCircle2 className="w-10 h-10 text-accent-pink" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-pink text-white font-bold rounded-full flex items-center justify-center border-4 border-[#0a0514]">3</div>
              </div>
              <h4 className="font-bold text-2xl mb-4">Earn Returns</h4>
              <p className="text-on-dark-muted text-center max-w-[280px] leading-relaxed">Upload payment proof, get your bonds allocated, and track your scheduled coupon payouts.</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section id="company" className="w-full py-24 md:py-32 relative z-20 bg-surface-canvas-dark border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col items-center text-center">
          <ScrollReveal delay="0.1s">
            <h2 className="text-accent-violet font-bold tracking-widest uppercase text-sm mb-4">Our Company</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-8">Building the Financial Infrastructure of Tomorrow</h3>
            <p className="text-on-dark-muted text-lg leading-relaxed max-w-3xl mx-auto mb-16">
              AFIN is backed by a consortium of leading financial technologists, economists, and legal experts dedicated to bridging the gap between national treasuries and everyday investors.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <ScrollReveal delay="0.2s">
              <div className="bg-[#150f23] p-8 rounded-2xl border border-white/5 shadow-level-1 h-full flex flex-col items-center text-center">
                <Globe className="w-10 h-10 text-accent-lime mb-4" />
                <h4 className="font-bold text-xl mb-2">Global Vision</h4>
                <p className="text-on-dark-muted text-sm">Expanding digital financial inclusion across the continent.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay="0.4s">
              <div className="bg-[#150f23] p-8 rounded-2xl border border-white/5 shadow-level-1 h-full flex flex-col items-center text-center">
                <Building2 className="w-10 h-10 text-accent-violet mb-4" />
                <h4 className="font-bold text-xl mb-2">Institutional Grade</h4>
                <p className="text-on-dark-muted text-sm">Partnered with top-tier brokers and regulated financial entities.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay="0.6s">
              <div className="bg-[#150f23] p-8 rounded-2xl border border-white/5 shadow-level-1 h-full flex flex-col items-center text-center">
                <Users className="w-10 h-10 text-accent-pink mb-4" />
                <h4 className="font-bold text-xl mb-2">Dedicated Team</h4>
                <p className="text-on-dark-muted text-sm">Led by industry veterans with deep expertise in fintech.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#05020a] py-16 border-t border-white/5 relative z-20">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-8">
          <div className="flex flex-col gap-3 text-left">
            <h1 className="font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-2xl font-bold tracking-wider">
              AFIN
            </h1>
            <p className="text-on-dark-muted text-sm">African Fixed Income Network.<br/>Empowering investors in Mozambique.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-on-dark-muted w-full md:w-auto">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-8 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-on-dark-faint gap-6 md:gap-4">
          <div>&copy; {new Date().getFullYear()} AFIN - African Fixed Income Network. All rights reserved.</div>
          <a href="https://www.upwork.com/freelancers/~018cb6b2be97dd2433" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Developed by Hash-overflow</a>
        </div>
      </footer>
    </div>
  );
}
