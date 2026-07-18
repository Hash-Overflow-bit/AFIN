"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { TrendingUp, Calendar, Landmark, ArrowRight, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface PublicBond {
  id: string;
  name: string;
  issuer: string;
  couponRate: number;
  yieldRate?: number;
  currency: string;
  minInvestment: number;
  maturityDate: string;
  status: string;
  couponFrequency: string;
  totalIssuance?: number;
}

// Fallback bonds to display when API is unreachable
const fallbackBonds: PublicBond[] = [
  {
    id: "preview-1",
    name: "OT Mozambique 2028",
    issuer: "Republic of Mozambique",
    couponRate: 16.5,
    yieldRate: 17.2,
    currency: "MZN",
    minInvestment: 50000,
    maturityDate: "2028-06-15",
    status: "OPEN",
    couponFrequency: "SEMI_ANNUAL",
    totalIssuance: 5000000000,
  },
  {
    id: "preview-2",
    name: "BT Treasury Bill 364D",
    issuer: "Republic of Mozambique",
    couponRate: 14.8,
    currency: "MZN",
    minInvestment: 100000,
    maturityDate: "2027-03-20",
    status: "OPEN",
    couponFrequency: "ANNUAL",
    totalIssuance: 2000000000,
  },
  {
    id: "preview-3",
    name: "OT Sovereign 2030",
    issuer: "Republic of Mozambique",
    couponRate: 18.0,
    yieldRate: 18.5,
    currency: "MZN",
    minInvestment: 25000,
    maturityDate: "2030-12-01",
    status: "CLOSED",
    couponFrequency: "SEMI_ANNUAL",
    totalIssuance: 8000000000,
  },
];

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-MZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AnimatedBondRow({ bond, index, isVisible }: { bond: PublicBond; index: number; isVisible: boolean }) {
  const t = useTranslations('Landing');
  const [isExpanded, setIsExpanded] = useState(false);
  const isOpen = bond.status === "OPEN";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`w-full group rounded-2xl border transition-all duration-300 overflow-hidden ${
        isExpanded 
          ? 'bg-[#1a1325] border-accent-violet/50 shadow-[0_0_30px_rgba(152,143,222,0.15)]' 
          : 'bg-[#110b1f] border-white/10 hover:border-white/20 hover:bg-[#150e26]'
      }`}
    >
      <div 
        className="px-6 py-5 cursor-pointer flex flex-col md:flex-row md:items-center gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left: Status & Name */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex items-center justify-center w-3 h-3">
            {isOpen && <span className="absolute w-full h-full bg-accent-lime rounded-full animate-ping opacity-50" />}
            <span className={`relative w-2 h-2 rounded-full ${isOpen ? 'bg-accent-lime' : 'bg-white/20'}`} />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg md:text-xl">{bond.name}</h4>
            <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
              <Landmark className="w-3.5 h-3.5" />
              {bond.issuer}
            </p>
          </div>
        </div>

        {/* Middle: Rates */}
        <div className="flex items-center gap-6 md:gap-12 lg:gap-16 flex-shrink-0 mt-4 md:mt-0">
          <div className="text-left w-20 lg:w-24">
            <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-widest font-semibold mb-0.5">{t('couponRate')}</p>
            <p className="text-accent-violet text-xl md:text-2xl font-bold tracking-tight">
              {Number(bond.couponRate).toFixed(1)}<span className="text-sm text-accent-violet/70">%</span>
            </p>
          </div>
          <div className="text-left w-20 lg:w-24 hidden sm:block">
            {bond.yieldRate && (
              <>
                <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-widest font-semibold mb-0.5">{t('yield')}</p>
                <p className="text-accent-lime text-xl md:text-2xl font-bold tracking-tight">
                  {Number(bond.yieldRate).toFixed(1)}<span className="text-sm text-accent-lime/70">%</span>
                </p>
              </>
            )}
          </div>
          <div className="text-left w-24">
             <div className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isOpen ? 'text-white' : 'text-slate-500'} md:mt-4`}>
                {isOpen ? t('statusOpen') : t('statusClosed')}
             </div>
          </div>
        </div>
        
        {/* Right: Expand Icon */}
        <div className="hidden md:flex items-center justify-center w-8 ml-4 flex-shrink-0">
          <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-accent-violet/20 text-accent-violet rotate-180' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-6 md:p-8 bg-black/20 flex flex-col lg:flex-row gap-8 justify-between">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-accent-violet">
                    <Calendar className="w-4 h-4" />
                    <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">{t('maturity')}</p>
                  </div>
                  <p className="text-white font-medium text-sm pl-5.5">{formatDate(bond.maturityDate)}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-accent-violet">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">{t('minInvestment')}</p>
                  </div>
                  <p className="text-white font-medium text-sm pl-5.5">{formatCurrency(Number(bond.minInvestment), bond.currency)}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-accent-violet">
                    <Clock className="w-4 h-4" />
                    <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">{t('frequency')}</p>
                  </div>
                  <p className="text-white font-medium text-sm pl-5.5">{bond.couponFrequency === "SEMI_ANNUAL" ? t('semiAnnual') : bond.couponFrequency === "ANNUAL" ? t('annual') : bond.couponFrequency}</p>
                </div>

                {bond.totalIssuance && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-accent-violet">
                      <Landmark className="w-4 h-4" />
                      <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">{t('issuance')}</p>
                    </div>
                    <p className="text-white font-medium text-sm pl-5.5">{formatCurrency(Number(bond.totalIssuance), bond.currency)}</p>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-end justify-start lg:justify-end mt-4 lg:mt-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-accent-violet hover:bg-[#422082] text-white rounded-xl px-8 py-3.5 font-bold uppercase tracking-wider text-sm transition-all hover:shadow-[0_0_20px_rgba(106,95,193,0.4)] group"
                >
                  {t('signInToInvest')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div className="w-full bg-[#110b1f] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-3 h-3 bg-white/10 rounded-full" />
        <div>
          <div className="w-48 h-6 bg-white/10 rounded mb-2" />
          <div className="w-32 h-4 bg-white/5 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-16 flex-shrink-0">
        <div className="w-16 h-8 bg-white/10 rounded" />
        <div className="w-16 h-8 bg-white/10 rounded hidden sm:block" />
        <div className="w-20 h-5 bg-white/5 rounded" />
      </div>
      <div className="w-8 h-8 bg-white/5 rounded-full" />
    </div>
  );
}

export default function FeaturedOfferings() {
  const t = useTranslations('Landing');
  const [bonds, setBonds] = useState<PublicBond[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch bonds from public endpoint
  useEffect(() => {
    const fetchBonds = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const res = await fetch(`${apiUrl}/bonds/public`);
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        if (result.data && result.data.length > 0) {
          setBonds(result.data);
        } else {
          setBonds(fallbackBonds);
        }
      } catch {
        setBonds(fallbackBonds);
      } finally {
        setLoading(false);
      }
    };
    fetchBonds();
  }, []);

  return (
    <section
      id="offerings"
      ref={sectionRef}
      className="w-full py-24 md:py-32 relative z-20 overflow-hidden bg-[#0a0514] border-t border-white/5"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-accent-lime/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className={`flex flex-col items-center text-center mb-16 md:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-accent-lime font-bold tracking-widest uppercase text-sm mb-4">{t('offeringsSubtitle')}</h2>
          <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            {t('offeringsTitle')}
          </h3>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t('offeringsDesc')}
          </p>
        </div>

        {/* Market Terminal Stack */}
        <div className="flex flex-col gap-4">
          {/* Header Row (Desktop Only) */}
          <div className={`hidden md:flex items-center px-6 pb-2 border-b border-white/10 transition-all duration-700 delay-200 gap-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex-1 text-slate-500 text-xs font-bold uppercase tracking-widest">{t('colAssetIssuer')}</div>
            <div className="flex items-center gap-6 md:gap-12 lg:gap-16 flex-shrink-0">
              <div className="w-20 lg:w-24 text-slate-500 text-xs font-bold uppercase tracking-widest">{t('colCoupon')}</div>
              <div className="w-20 lg:w-24 text-slate-500 text-xs font-bold uppercase tracking-widest hidden sm:block">{t('colYield')}</div>
              <div className="w-24 text-slate-500 text-xs font-bold uppercase tracking-widest">{t('colStatus')}</div>
            </div>
            {/* Spacer for the Chevron icon */}
            <div className="w-8 ml-4 flex-shrink-0"></div>
          </div>

          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            bonds.map((bond, index) => (
              <AnimatedBondRow key={bond.id} bond={bond} index={index} isVisible={isVisible} />
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-12 md:mt-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-transparent border border-white/20 text-white rounded-full px-8 py-3.5 font-bold uppercase tracking-wider text-sm hover:border-accent-lime hover:text-accent-lime transition-all duration-300 group"
          >
            {t('createAccountToInvest')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
