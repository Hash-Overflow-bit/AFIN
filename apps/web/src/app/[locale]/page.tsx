"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, Landmark, Briefcase, TrendingUp, Shield, BarChart3, Users, FileText, CheckCircle2, Globe, Building2, Menu, X, Zap, Monitor } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from 'next-intl';

const YieldCurveChart = dynamic(() => import("@/components/landing/YieldCurveChart"), { ssr: false });
const FeaturedOfferings = dynamic(() => import("@/components/landing/FeaturedOfferings"), { ssr: false });
const RoleBenefits = dynamic(() => import("@/components/landing/RoleBenefits"), { ssr: false });
const AnimatedCapabilities = dynamic(() => import("@/components/landing/AnimatedCapabilities"), { ssr: false });
const PartnerBenefits = dynamic(() => import("@/components/landing/PartnerBenefits"), { ssr: false });
const AnimatedInfrastructure = dynamic(() => import("@/components/landing/AnimatedInfrastructure"), { ssr: false });

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
  const t = useTranslations('Landing');
  const tNav = useTranslations('Navigation');

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
              AGBX
            </h1>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-primary/90">
            <Link href="#about" className="hover:text-accent-lime transition-colors">{tNav('about')}</Link>
            <Link href="#how-it-works" className="hover:text-accent-lime transition-colors">{tNav('howItWorks')}</Link>
            <Link href="#offerings" className="hover:text-accent-lime transition-colors">{tNav('offerings')}</Link>
            <Link href="#company" className="hover:text-accent-lime transition-colors">{tNav('company')}</Link>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm font-medium hover:text-accent-lime transition-colors">
            {tNav('login')}
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-surface-night text-on-primary border border-hairline-violet px-6 py-2.5 rounded-full hover:bg-accent-violet-deep hover:border-accent-violet transition-all shadow-[0_0_15px_rgba(106,95,193,0.3)]"
          >
            {tNav('becomePartner')}
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
          <Link href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">{tNav('about')}</Link>
          <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">{tNav('howItWorks')}</Link>
          <Link href="#offerings" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">{tNav('offerings')}</Link>
          <Link href="#company" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">{tNav('company')}</Link>

          <div className="w-full h-px bg-white/10 my-2" />

          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-accent-lime transition-colors">
            {tNav('login')}
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-medium bg-surface-night text-on-primary border border-hairline-violet px-6 py-3 rounded-full text-center hover:bg-accent-violet-deep transition-all"
          >
            {tNav('applyNow')}
          </Link>
        </div>
      )}

      {/* 1. Hero Section (Dark) */}
      <main className="w-full max-w-[1400px] mx-auto px-8 flex flex-col lg:flex-row items-center justify-between relative z-10 pt-20 pb-28">

        {/* Left Content */}
        <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-16 lg:mb-0 mt-8">
          <ScrollReveal delay="0.1s">
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-on-primary/80 mb-8 max-w-lg leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay="0.3s">
            <div className="flex items-center gap-4 relative">
              <Link
                href="/register"
                className="bg-surface-night border border-hairline-violet text-on-primary rounded-full px-8 py-3.5 font-bold uppercase tracking-console text-sm inline-flex items-center group hover:bg-accent-violet-deep transition-colors"
              >
                {t('applyPartner')} <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              <p className="text-sm font-medium text-on-primary/70 uppercase tracking-widest">{t('traded')}</p>
            </div>

            {/* Concentric Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[200px] h-[200px] rounded-full border border-white/10 absolute animate-[spin_40s_linear_infinite]" />
              <div className="w-[350px] h-[350px] rounded-full border border-white/10 absolute animate-[spin_60s_linear_infinite_reverse]" />
              <div className="w-[500px] h-[500px] rounded-full border border-white/10 absolute animate-[spin_80s_linear_infinite]" />
              <div className="w-[650px] h-[650px] rounded-full border border-white/5 absolute animate-[spin_100s_linear_infinite_reverse]" />
            </div>

            {/* Floating Nodes */}
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
          <div className="flex w-1/2 justify-around items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Shield className="w-4 h-4 md:w-6 md:h-6" /> Ministry of Economy</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Landmark className="w-4 h-4 md:w-6 md:h-6" /> Mozambique Stock Exchange</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Briefcase className="w-4 h-4 md:w-6 md:h-6" /> Trusted Broker Network</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><BarChart3 className="w-4 h-4 md:w-6 md:h-6" /> Central Bank</div>
          </div>
          <div className="flex w-1/2 justify-around items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Shield className="w-4 h-4 md:w-6 md:h-6" /> Ministry of Economy</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Landmark className="w-4 h-4 md:w-6 md:h-6" /> Mozambique Stock Exchange</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><Briefcase className="w-4 h-4 md:w-6 md:h-6" /> Trusted Broker Network</div>
            <div className="flex items-center gap-2 md:gap-3 font-display font-bold text-sm sm:text-base md:text-xl"><BarChart3 className="w-4 h-4 md:w-6 md:h-6" /> Central Bank</div>
          </div>
        </div>
      </ScrollReveal>

      {/* Yield Curve Chart */}
      <YieldCurveChart />

      {/* 2. About Section (Light) */}
      <section id="about" className="w-full py-24 md:py-32 relative z-20 bg-white overflow-hidden text-[#1f1633]">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row gap-16 items-center">
          <ScrollReveal delay="0.1s" className="w-full md:w-1/2">
            <h2 className="text-accent-violet-deep font-bold tracking-widest uppercase text-sm mb-4">{t('aboutSubtitle')}</h2>
            <h3 className="font-display text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-[#1f1633]">
              {t('aboutTitle')}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {t('aboutP1')}
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We eliminate traditional barriers to entry by providing a transparent, fully digital brokerage experience where you can securely verify your identity, browse active bond issuances, and track your portfolio&apos;s performance in real time.
            </p>
          </ScrollReveal>

          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ScrollReveal delay="0.3s" className="h-full">
              <div className="bg-[#f9fafb] p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                <Shield className="w-12 h-12 text-accent-violet mb-6" />
                <h4 className="font-bold text-2xl mb-3 text-[#1f1633]">{t('aboutFeature1Title')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('aboutFeature1Desc')}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay="0.5s" className="h-full">
              <div className="bg-[#f9fafb] p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                <TrendingUp className="w-12 h-12 text-accent-violet-mid mb-6" />
                <h4 className="font-bold text-2xl mb-3 text-[#1f1633]">{t('aboutFeature2Title')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('aboutFeature2Desc')}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. {t('platformSubtitle')} Section (Inverted to Dark) */}
      <section className="w-full py-24 md:py-32 relative z-20 bg-[#0a0514] border-t border-white/5 overflow-hidden text-on-primary">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="flex flex-col gap-8 items-center text-center max-w-3xl mx-auto">
            <ScrollReveal delay="0.1s" className="w-full">
              <h2 className="text-accent-lime font-bold tracking-widest uppercase text-sm mb-4">Platform Capabilities</h2>
              <h3 className="font-display text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white">
                {t('platformTitle')}
              </h3>
              <p className="text-white/60 text-lg leading-relaxed">
                {t('platformDesc')}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay="0.3s" className="w-full">
            <AnimatedCapabilities />
          </ScrollReveal>
        </div>
      </section>

      {/* 4. How it Works Section (Inverted to Light) */}
      <section id="how-it-works" className="w-full py-24 md:py-32 relative z-20 bg-white text-[#1f1633] border-t border-gray-100 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <ScrollReveal delay="0.1s" className="text-center mb-16 md:mb-20">
            <h2 className="text-accent-violet-deep font-bold tracking-widest uppercase text-sm mb-4">{t('howSubtitle')}</h2>
            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1f1633] mb-4">
              {t('howTitle')}
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('howDesc')}
            </p>
          </ScrollReveal>

          <div className="relative">
            {/* Desktop connecting line */}
            <ScrollReveal delay="0.3s" className="hidden lg:block absolute top-[72px] left-[12%] right-[12%] h-[3px] z-0">
              <div className="w-full h-full bg-gradient-to-r from-accent-violet via-accent-violet-mid to-accent-lime rounded-full opacity-20" />
              <div className="absolute inset-0 h-full bg-gradient-to-r from-accent-violet via-accent-violet-mid to-accent-lime rounded-full opacity-40" style={{ backgroundSize: '20px 3px', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #ffffff 10px, #ffffff 14px)' }} />
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative z-10">
              <ScrollReveal delay="0.2s" className="group">
                <div className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:border-accent-violet/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 bg-accent-violet/10 rounded-xl flex items-center justify-center group-hover:bg-accent-violet/20 transition-colors">
                        <Users className="w-7 h-7 text-accent-violet" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-accent-violet text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">1</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent-violet">Step 1</p>
                      <h4 className="font-bold text-xl text-[#1f1633]">{t('howStep1Title')}</h4>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {t('howStep1Desc')}
                  </p>
                  <div className="lg:hidden flex justify-center mt-5">
                    <div className="w-[2px] h-8 bg-gradient-to-b from-accent-violet to-accent-violet-mid opacity-30" />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay="0.35s" className="group">
                <div className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:border-accent-violet-mid/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 bg-accent-violet-mid/10 rounded-xl flex items-center justify-center group-hover:bg-accent-violet-mid/20 transition-colors">
                        <FileText className="w-7 h-7 text-accent-violet-mid" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-accent-violet-mid text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">2</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent-violet-mid">Step 2</p>
                      <h4 className="font-bold text-xl text-[#1f1633]">{t('howStep2Title')}</h4>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {t('howStep2Desc')}
                  </p>
                  <div className="lg:hidden flex justify-center mt-5">
                    <div className="w-[2px] h-8 bg-gradient-to-b from-accent-violet-mid to-[#8ab834] opacity-30" />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay="0.5s" className="group">
                <div className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8ab834]/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 bg-[#c2ef4e]/20 rounded-xl flex items-center justify-center group-hover:bg-[#c2ef4e]/30 transition-colors">
                        <Landmark className="w-7 h-7 text-[#6d8a2e]" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#8ab834] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">3</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6d8a2e]">Step 3</p>
                      <h4 className="font-bold text-xl text-[#1f1633]">Auction</h4>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {t('howStep3Desc')}
                  </p>
                  <div className="lg:hidden flex justify-center mt-5">
                    <div className="w-[2px] h-8 bg-gradient-to-b from-[#8ab834] to-[#fa7faa] opacity-30" />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay="0.65s" className="group">
                <div className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:border-accent-pink/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 bg-[#fa7faa]/10 rounded-xl flex items-center justify-center group-hover:bg-[#fa7faa]/20 transition-colors">
                        <CheckCircle2 className="w-7 h-7 text-[#fa7faa]" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#fa7faa] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">4</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#fa7faa]">Step 4</p>
                      <h4 className="font-bold text-xl text-[#1f1633]">{t('howStep4Title')}</h4>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {t('howStep4Desc')}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Roles & Benefits Section (Dark) */}
      <RoleBenefits />

      {/* 6. Featured Offerings (Light) */}
      <FeaturedOfferings />

      {/* 7. {t('partnerTitleHighlight')} Section (Dark) */}
      <section className="w-full py-24 md:py-32 relative z-20 bg-[#0a0514] text-on-primary overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-lime/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
          <ScrollReveal delay="0.1s" className="text-center mb-16">
            <h2 className="text-accent-lime font-bold tracking-widest uppercase text-sm mb-4">{t('partnerSubtitle')}</h2>
            <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              {t('partnerTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-lime to-emerald-400">Partner Broker</span>
            </h3>
            <p className="text-xl md:text-2xl font-light text-white/80 leading-relaxed max-w-3xl mx-auto mb-8">
              {t('partnerDesc1')}
            </p>
            <p className="text-lg text-white/60 leading-relaxed max-w-4xl mx-auto">
              Join the African Government Bond Exchange (AGBX) and become part of the next generation of African capital markets. 
              AGBX empowers licensed brokers with the technology to reach more investors, streamline operations, and offer a world-class digital investment experience.
            </p>
          </ScrollReveal>

          <ScrollReveal delay="0.3s" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-surface-night border border-hairline-violet p-8 rounded-3xl hover:border-accent-violet transition-colors">
              <Users className="w-10 h-10 text-accent-lime mb-6" />
              <h4 className="font-bold text-xl mb-3 text-white">{t('partnerFeature1Title')}</h4>
              <p className="text-white/60 leading-relaxed">{t('partnerFeature1Desc')}</p>
            </div>
            <div className="bg-surface-night border border-hairline-violet p-8 rounded-3xl hover:border-accent-violet transition-colors">
              <Globe className="w-10 h-10 text-accent-pink mb-6" />
              <h4 className="font-bold text-xl mb-3 text-white">{t('partnerFeature2Title')}</h4>
              <p className="text-white/60 leading-relaxed">{t('partnerFeature2Desc')}</p>
            </div>
            <div className="bg-surface-night border border-hairline-violet p-8 rounded-3xl hover:border-accent-violet transition-colors">
              <Zap className="w-10 h-10 text-accent-violet mb-6" />
              <h4 className="font-bold text-xl mb-3 text-white">{t('partnerFeature3Title')}</h4>
              <p className="text-white/60 leading-relaxed">{t('partnerFeature3Desc')}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay="0.5s" className="text-center">
            <Link
              href="/register?role=BROKER"
              className="bg-accent-lime text-ink-deep font-bold uppercase tracking-console text-sm px-10 py-4 rounded-full inline-flex items-center hover:bg-white transition-colors shadow-[0_0_20px_rgba(194,239,78,0.3)] group"
            >
              {t('partnerCTA')} <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. {t('benefitsTitle')} AGBX Section ({t('benefitsSubtitle')} - Inverted to Light) */}
      <PartnerBenefits />

      {/* 9. Company Section - Animated Infrastructure (Inverted to Dark) */}
      <section id="company" className="w-full py-24 md:py-32 relative z-20 bg-[#0a0514] border-t border-white/5 text-on-primary">
        <div className="max-w-[1400px] mx-auto px-8">
          <ScrollReveal delay="0.1s" className="text-center mb-16">
            <h2 className="text-accent-lime font-bold tracking-widest uppercase text-sm mb-4">{t('companySubtitle')}</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-extrabold mb-6 text-white">{t('companyTitle')}</h3>
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto">
              {t('companyDesc')}
            </p>
          </ScrollReveal>

          {/* Interactive Infrastructure Network */}
          <ScrollReveal delay="0.3s">
            <AnimatedInfrastructure />
          </ScrollReveal>
        </div>
      </section>

      {/* 10. Final CTA Section (Light) */}
      <section className="w-full py-24 md:py-32 relative z-20 bg-[#f9fafb] text-[#1f1633] border-t border-gray-100 overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-6 md:px-8 text-center">
          <ScrollReveal delay="0.1s" className="mb-16">
            <h2 className="text-accent-violet-deep font-bold tracking-widest uppercase text-sm mb-6">
              {t('ctaSubtitle')}
            </h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-6">
              {t('ctaDesc1')}
            </p>
            <p className="text-gray-500 text-md leading-relaxed max-w-2xl mx-auto">
              {t('ctaDesc2')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay="0.3s" className="bg-white p-10 md:p-14 rounded-3xl border border-gray-100 shadow-md relative overflow-hidden">
            {/* Subtle light glow behind CTA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-violet/5 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <h3 className="font-display text-4xl md:text-5xl font-extrabold text-[#1f1633] mb-6">
                {t('ctaBoxTitle')}
              </h3>
              <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('ctaBoxDesc')}
              </p>
              <Link
                href="/register?role=BROKER"
                className="bg-surface-night text-on-primary font-bold uppercase tracking-console text-sm px-10 py-4 rounded-full inline-flex items-center hover:bg-accent-violet-deep hover:-translate-y-1 transition-all shadow-md group"
              >
                {t('ctaBoxBtn')} <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 11. Footer (Dark) */}
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
              AGBX
            </h2>
          </div>

          {/* Minimal Bottom Bar */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center text-[#8e8e8e] text-sm font-medium gap-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
              <span>&copy; {new Date().getFullYear()} {t('footerRights')}</span>
              <a href="https://www.upwork.com/freelancers/~018cb6b2be97dd2433" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors opacity-50 hover:opacity-100 hidden md:block">{t('footerDevelopedBy')}</a>
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
