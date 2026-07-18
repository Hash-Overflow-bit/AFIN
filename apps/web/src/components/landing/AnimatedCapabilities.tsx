"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, TrendingUp, Briefcase, Zap, CheckCircle2, FileText, Users, Monitor, Globe } from 'lucide-react';

export default function AnimatedCapabilities() {
  const t = useTranslations("Landing");
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    {
      id: 'identity',
      title: t('catIdentity'),
      icon: Shield,
      features: [t('platformFeatures.0'), t('platformFeatures.7')],
    },
    {
      id: 'market',
      title: t('catMarket'),
      icon: TrendingUp,
      features: [t('platformFeatures.1'), t('platformFeatures.2'), t('platformFeatures.3')],
    },
    {
      id: 'asset',
      title: t('catAsset'),
      icon: Briefcase,
      features: [t('platformFeatures.4'), t('platformFeatures.5')],
    },
    {
      id: 'intelligence',
      title: t('catIntelligence'),
      icon: Zap,
      features: [t('platformFeatures.6'), t('platformFeatures.8'), t('platformFeatures.9')],
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % categories.length);
    }, 6000); // cycle every 6 seconds
    return () => clearInterval(timer);
  }, [categories.length]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
      {/* Interactive Tabs */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {categories.map((cat, index) => {
          const isActive = index === activeTab;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(index)}
              className={`text-left p-6 rounded-2xl transition-all duration-300 border ${
                isActive 
                  ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(152,143,222,0.1)]' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-accent-lime text-[#0a0514]' : 'bg-white/5 text-slate-400'}`}>
                  <Icon size={24} />
                </div>
                <h4 className={`text-xl font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {cat.title}
                </h4>
              </div>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-3 mt-5 ml-2">
                      {cat.features.map((feature, i) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 size={18} className="text-accent-lime flex-shrink-0 mt-0.5" />
                          <span className="text-[15px] font-medium text-slate-300">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Animated Visuals */}
      <div className="lg:col-span-7 relative flex items-center justify-center min-h-[350px] lg:min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 0 && <IdentityVisual key="identity" />}
          {activeTab === 1 && <MarketVisual key="market" />}
          {activeTab === 2 && <AssetVisual key="asset" />}
          {activeTab === 3 && <IntelligenceVisual key="intelligence" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Visual Components
// -------------------------------------------------------------

function IdentityVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full bg-[#110b1f] rounded-[2rem] border border-white/10 relative overflow-hidden flex items-center justify-center shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/20 to-transparent opacity-50" />
      
      {/* Central Shield */}
      <motion.div 
        animate={{ boxShadow: ['0 0 0px rgba(152,143,222,0)', '0 0 40px rgba(152,143,222,0.4)', '0 0 0px rgba(152,143,222,0)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 bg-accent-violet rounded-2xl flex items-center justify-center relative z-10 border border-white/20"
      >
        <Shield size={40} className="text-white" />
      </motion.div>

      {/* Connecting nodes */}
      <Node icon={<FileText size={20} />} x="-120px" y="-100px" delay={0} />
      <Node icon={<Users size={20} />} x="120px" y="-60px" delay={0.2} />
      <Node icon={<Monitor size={20} />} x="-80px" y="120px" delay={0.4} />

      {/* SVG Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <motion.path 
          d="M 50% 50% L calc(50% - 120px) calc(50% - 100px)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
        />
        <motion.path 
          d="M 50% 50% L calc(50% + 120px) calc(50% - 60px)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.path 
          d="M 50% 50% L calc(50% - 80px) calc(50% + 120px)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.4 }}
        />
      </svg>
    </motion.div>
  );
}

function Node({ icon, x, y, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: 1, x, y }}
      transition={{ type: "spring", stiffness: 80, delay }}
      className="absolute w-14 h-14 bg-[#1a1325] border border-white/20 rounded-xl flex items-center justify-center text-accent-lime z-10 shadow-lg"
      style={{ top: 'calc(50% - 28px)', left: 'calc(50% - 28px)' }}
    >
      {icon}
    </motion.div>
  )
}

function MarketVisual() {
  const t = useTranslations("Landing");
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full bg-[#110b1f] rounded-[2rem] border border-white/10 p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-lime/5 rounded-full blur-[80px]" />

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white text-lg font-bold">{t('liveOrderBook')}</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse"></span>
          <span className="text-accent-lime text-sm font-medium tracking-wide uppercase">{t('syncing')}</span>
        </div>
      </div>
      {[85, 45, 100, 60, 75].map((width, i) => (
        <motion.div 
          key={i}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${width}%`, opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.15 }}
          className="h-12 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden flex items-center px-5"
        >
           <motion.div 
             animate={{ x: ['-100%', '300%'] }} 
             transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
             className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
           />
           <div className="w-full flex justify-between items-center relative z-10">
             <span className="w-20 h-2 bg-white/20 rounded-full"></span>
             <span className="w-12 h-2 bg-accent-lime/60 rounded-full"></span>
           </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AssetVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full bg-[#110b1f] rounded-[2rem] border border-white/10 p-10 flex items-end justify-between gap-4 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-violet/10 to-transparent" />
      
      {[30, 50, 40, 70, 60, 90, 80].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ type: "spring", stiffness: 50, delay: i * 0.1 }}
          className="w-full bg-gradient-to-t from-accent-violet/80 to-accent-lime/80 rounded-t-xl relative group"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-white/70 text-sm font-mono bg-white/10 px-2 py-1 rounded backdrop-blur-sm"
          >
            {height}%
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function IntelligenceVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full bg-[#110b1f] rounded-[2rem] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="w-80 h-80 border-[2px] border-dashed border-white/10 rounded-full flex items-center justify-center relative"
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 border-[2px] border-accent-lime/20 rounded-full flex items-center justify-center bg-accent-violet/5"
        >
          <Globe className="text-accent-violet w-20 h-20 opacity-80" />
        </motion.div>

        {/* Orbiting element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent-lime rounded-full shadow-[0_0_15px_#ccff00]" />
      </motion.div>

      {/* Floating data nodes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, delay: i * 0.7, repeat: Infinity }}
          className="absolute w-3 h-3 bg-white/80 rounded-full shadow-[0_0_10px_white]"
          style={{
            top: `${15 + i * 18}%`,
            left: `${15 + (i % 3) * 35}%`
          }}
        />
      ))}
    </motion.div>
  );
}
