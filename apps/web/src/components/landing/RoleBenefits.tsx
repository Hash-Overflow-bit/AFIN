"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { User, Briefcase, CheckCircle2, TrendingUp, FileText, BarChart3, Database, Users } from "lucide-react";
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from "framer-motion";

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
  const t = useTranslations('Landing');
  const [activeRole, setActiveRole] = useState<'investor' | 'broker'>('investor');

  const investorBenefits = [t('investorBenefits.0'), t('investorBenefits.1'), t('investorBenefits.2'), t('investorBenefits.3')];
  const brokerBenefits = [t('brokerBenefits.0'), t('brokerBenefits.1'), t('brokerBenefits.2'), t('brokerBenefits.3')];

  return (
    <section className="py-24 md:py-32 bg-[#0a0514] border-t border-white/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-accent-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-lime/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              {t('roleBenefitsTitle1')} <span className="text-accent-violet">{t('roleBenefitsTitle2')}</span>
            </h2>
            <p className="text-white/60 text-lg">
              {t('roleBenefitsDesc')}
            </p>
          </div>
        </ScrollReveal>

        {/* Persona Switcher Toggle */}
        <ScrollReveal delay="0.1s" className="flex justify-center mb-16">
          <div className="bg-white/5 p-1.5 rounded-full border border-white/10 flex items-center shadow-lg relative">
            <div 
              className="absolute h-[calc(100%-12px)] top-1.5 rounded-full transition-all duration-500 ease-out z-0"
              style={{
                width: 'calc(50% - 6px)',
                left: activeRole === 'investor' ? '6px' : 'calc(50%)',
                backgroundColor: activeRole === 'investor' ? 'rgba(106, 95, 193, 0.2)' : 'rgba(250, 127, 170, 0.2)',
                border: activeRole === 'investor' ? '1px solid rgba(106, 95, 193, 0.5)' : '1px solid rgba(250, 127, 170, 0.5)',
              }}
            />
            
            <button
              onClick={() => setActiveRole('investor')}
              className={`relative z-10 flex items-center gap-2 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm transition-colors duration-300 ${
                activeRole === 'investor' ? 'text-accent-violet' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={18} />
              {t('tabForInvestors')}
            </button>
            <button
              onClick={() => setActiveRole('broker')}
              className={`relative z-10 flex items-center gap-2 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm transition-colors duration-300 ${
                activeRole === 'broker' ? 'text-accent-pink' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase size={18} />
              {t('tabForBrokers')}
            </button>
          </div>
        </ScrollReveal>

        {/* Dynamic Content Area */}
        <div className="bg-[#110b1f] rounded-[2rem] border border-white/10 p-8 lg:p-16 shadow-2xl relative overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeRole === 'investor' ? (
              <motion.div 
                key="investor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center"
              >
                <div className="w-full lg:w-1/2">
                  <h3 className="text-3xl font-display font-bold text-white mb-4">{t('investorTitle')} Experience</h3>
                  <p className="text-white/60 mb-10 leading-relaxed text-lg">
                    {t('investorDesc')}
                  </p>
                  <ul className="space-y-6">
                    {investorBenefits.map((benefit, i) => (
                      <motion.li 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        key={i} 
                        className="flex items-start gap-4"
                      >
                        <div className="p-1.5 bg-accent-violet/10 rounded-full border border-accent-violet/20 flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-accent-violet" />
                        </div>
                        <span className="text-slate-200 font-medium text-lg">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="w-full lg:w-1/2 h-[400px]">
                  <InvestorVisual />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="broker"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center"
              >
                <div className="w-full lg:w-1/2">
                  <h3 className="text-3xl font-display font-bold text-white mb-4">{t('brokerTitle')} Experience</h3>
                  <p className="text-white/60 mb-10 leading-relaxed text-lg">
                    {t('brokerDesc')}
                  </p>
                  <ul className="space-y-6">
                    {brokerBenefits.map((benefit, i) => (
                      <motion.li 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        key={i} 
                        className="flex items-start gap-4"
                      >
                        <div className="p-1.5 bg-accent-pink/10 rounded-full border border-accent-pink/20 flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-accent-pink" />
                        </div>
                        <span className="text-slate-200 font-medium text-lg">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="w-full lg:w-1/2 h-[400px]">
                  <BrokerVisual />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Visual Components
// -------------------------------------------------------------

function InvestorVisual() {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-[#1a1325] rounded-3xl border border-white/5 overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-violet/10 to-transparent" />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Line Chart Area */}
      <svg className="absolute w-full h-[60%] bottom-10 z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        <motion.path
          d="M0,100 L0,80 C20,80 30,60 50,70 C70,80 80,40 100,20 L100,100 Z"
          fill="url(#gradientViolet)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d="M0,80 C20,80 30,60 50,70 C70,80 80,40 100,20"
          fill="none"
          stroke="#6a5fc1"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradientViolet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(106, 95, 193, 0.4)" />
            <stop offset="100%" stopColor="rgba(106, 95, 193, 0.0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Asset Nodes */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="absolute w-12 h-12 bg-accent-lime rounded-full shadow-[0_0_20px_#ccff00] flex items-center justify-center text-[#1a1325]"
        style={{ left: '48%', top: '35%' }}
      >
        <TrendingUp size={24} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse", duration: 2 }}
        className="absolute px-3 py-1.5 bg-white/10 backdrop-blur-md rounded border border-white/20 text-white font-mono text-sm"
        style={{ left: '45%', top: '22%' }}
      >
        +14.5% Yield
      </motion.div>
    </div>
  );
}

function BrokerVisual() {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-[#1a1325] rounded-3xl border border-white/5 overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-pink/10 to-transparent" />
      
      <div className="w-full max-w-sm flex flex-col gap-5 relative z-10 px-8">
        
        {/* Mock Pipeline Steps */}
        {[
          { icon: FileText, label: "Issuance Setup", width: "100%", color: "bg-accent-pink" },
          { icon: Users, label: "Order Aggregation", width: "75%", color: "bg-accent-violet" },
          { icon: Database, label: "Allocation & Settlement", width: "40%", color: "bg-accent-lime" },
        ].map((step, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 border border-white/10 text-white`}>
                <step.icon size={16} />
              </div>
              <span className="text-white/80 text-sm font-medium">{step.label}</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden w-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: step.width }}
                transition={{ duration: 1, delay: 0.5 + i * 0.3, ease: "easeOut" }}
                className={`h-full ${step.color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Animated Data Pulses */}
      <motion.div 
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-1/4 right-1/4 w-32 h-32 bg-accent-pink/10 rounded-full blur-2xl"
      />
    </div>
  );
}
