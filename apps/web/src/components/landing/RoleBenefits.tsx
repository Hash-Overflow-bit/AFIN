"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { User, Briefcase, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

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
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}

export default function RoleBenefits() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-accent-violet/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-lime/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary mb-6">
              Tailored for <span className="text-accent-violet">Every Participant</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Whether you are looking to invest in secure government bonds or manage the issuance process, AGBX provides the specialized tools you need.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Investor Box */}
          <ScrollReveal delay="0.1s">
            <div className="group h-full bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:border-accent-violet/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              
              <div className="w-16 h-16 bg-accent-violet/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-accent-violet" />
              </div>
              
              <h3 className="text-2xl font-bold text-primary mb-4">For Investors</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Access a secure, transparent marketplace to invest in government bonds. Grow your wealth with reliable returns and real-time portfolio tracking.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Direct access to primary market bond issuances",
                  "Secure digital KYC and onboarding process",
                  "Real-time portfolio and coupon tracking",
                  "Automated pro-rata allocations",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-lime flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Broker Box */}
          <ScrollReveal delay="0.2s">
            <div className="group h-full bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:border-accent-pink/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              
              <div className="w-16 h-16 bg-accent-pink/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-accent-pink" />
              </div>
              
              <h3 className="text-2xl font-bold text-primary mb-4">For Brokers</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Streamline the entire bond lifecycle from issuance to allocation. Manage investors, verify payments, and generate comprehensive reports effortlessly.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Centralized dashboard for bond management",
                  "Efficient payment verification workflow",
                  "One-click automated allocation engine",
                  "Detailed investor and order reporting",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-pink flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
