"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TrendingUp, Calendar, Landmark, ChevronLeft, ChevronRight, ArrowRight, Clock } from "lucide-react";

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

function BondCard({ bond, index, isVisible }: { bond: PublicBond; index: number; isVisible: boolean }) {
  const isOpen = bond.status === "OPEN";

  return (
    <Link href="/login">
      <div
        className={`group relative flex-shrink-0 w-[320px] md:w-[360px] bg-[#110b1f] border border-white/5 rounded-2xl p-6 md:p-7 transition-all duration-500 hover:-translate-y-2 hover:border-accent-violet/40 hover:shadow-[0_0_40px_rgba(106,95,193,0.15)] cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: `${0.1 + index * 0.12}s` }}
      >
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isOpen
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-white/5 text-on-dark-muted border border-white/10'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            {isOpen ? "Open" : "Closed"}
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-accent-lime group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Bond Name & Issuer */}
        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-accent-lime transition-colors duration-300">{bond.name}</h4>
        <p className="text-on-dark-muted text-sm mb-6 flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5" />
          {bond.issuer}
        </p>

        {/* Coupon Rate (Hero Number) */}
        <div className="bg-white/[0.03] rounded-xl p-4 mb-5 border border-white/5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-on-dark-muted text-xs uppercase tracking-widest mb-1">Coupon Rate</p>
              <p className="text-accent-lime text-3xl font-bold tracking-tight">
                {Number(bond.couponRate).toFixed(1)}
                <span className="text-lg text-accent-lime/70">%</span>
              </p>
            </div>
            {bond.yieldRate && (
              <div className="text-right">
                <p className="text-on-dark-muted text-xs uppercase tracking-widest mb-1">Yield</p>
                <p className="text-accent-pink text-lg font-bold">
                  {Number(bond.yieldRate).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
            <div>
              <p className="text-on-dark-muted text-[10px] uppercase tracking-wider">Maturity</p>
              <p className="text-white font-medium text-xs">{formatDate(bond.maturityDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
            <div>
              <p className="text-on-dark-muted text-[10px] uppercase tracking-wider">Min. Investment</p>
              <p className="text-white font-medium text-xs">{formatCurrency(Number(bond.minInvestment), bond.currency)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
            <div>
              <p className="text-on-dark-muted text-[10px] uppercase tracking-wider">Frequency</p>
              <p className="text-white font-medium text-xs">{bond.couponFrequency === "SEMI_ANNUAL" ? "Semi-Annual" : bond.couponFrequency === "ANNUAL" ? "Annual" : bond.couponFrequency}</p>
            </div>
          </div>
          {bond.totalIssuance && (
            <div className="flex items-center gap-2 text-sm">
              <Landmark className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
              <div>
                <p className="text-on-dark-muted text-[10px] uppercase tracking-wider">Issuance</p>
                <p className="text-white font-medium text-xs">{formatCurrency(Number(bond.totalIssuance), bond.currency)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA hint */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-on-dark-muted text-xs group-hover:text-accent-lime transition-colors">
          <span>Sign in to invest</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[320px] md:w-[360px] bg-[#110b1f] border border-white/5 rounded-2xl p-6 md:p-7 animate-pulse">
      <div className="flex justify-between mb-5">
        <div className="w-16 h-6 bg-white/5 rounded-full" />
        <div className="w-4 h-4 bg-white/5 rounded" />
      </div>
      <div className="w-3/4 h-5 bg-white/5 rounded mb-2" />
      <div className="w-1/2 h-4 bg-white/5 rounded mb-6" />
      <div className="bg-white/[0.03] rounded-xl p-4 mb-5 border border-white/5">
        <div className="w-24 h-9 bg-white/5 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full h-8 bg-white/5 rounded" />
        <div className="w-full h-8 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function FeaturedOfferings() {
  const [bonds, setBonds] = useState<PublicBond[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 380;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="offerings"
      ref={sectionRef}
      className="w-full py-20 md:py-28 relative z-20 overflow-hidden"
      style={{ backgroundColor: '#0a0514' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-[#6a5fc1]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-[#fa7faa]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <h2 className="text-accent-violet font-bold tracking-widest uppercase text-sm mb-3">Featured Offerings</h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3">
              Current Bond Issuances
            </h3>
            <p className="text-on-dark-muted text-base md:text-lg max-w-xl">
              Explore active and recent government bond offerings. Sign in to subscribe and invest.
            </p>
          </div>

          {/* Scroll controls (desktop) */}
          <div className="hidden md:flex items-center gap-3 mt-6 md:mt-0">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-accent-violet/40 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-accent-violet/40 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Cards Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-5 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            bonds.map((bond, index) => (
              <BondCard key={bond.id} bond={bond} index={index} isVisible={isVisible} />
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-10 md:mt-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '0.5s' }}>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-surface-night border border-hairline-violet text-on-primary rounded-full px-8 py-3.5 font-bold uppercase tracking-console text-sm hover:bg-accent-violet-deep hover:border-accent-violet transition-all group"
          >
            Create Account to Invest
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
