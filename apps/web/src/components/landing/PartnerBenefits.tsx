"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe, Monitor, Users, BarChart3, Zap, Shield } from "lucide-react";

export default function PartnerBenefits() {
  const t = useTranslations("Landing");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const benefits = [
    { icon: Globe, key: 0, colSpan: "md:col-span-2 lg:col-span-2", bg: "bg-accent-violet-deep" },
    { icon: Monitor, key: 1, colSpan: "md:col-span-2 lg:col-span-1", bg: "bg-[#1f1633]" },
    { icon: Users, key: 2, colSpan: "md:col-span-2 lg:col-span-1", bg: "bg-[#1a1325]" },
    { icon: BarChart3, key: 3, colSpan: "md:col-span-2 lg:col-span-1", bg: "bg-accent-pink" },
    { icon: Zap, key: 4, colSpan: "md:col-span-2 lg:col-span-1", bg: "bg-[#1f1633]" },
    { icon: Shield, key: 5, colSpan: "md:col-span-2 lg:col-span-2", bg: "bg-accent-violet" },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 md:py-32 relative z-20 bg-white text-[#1f1633] overflow-hidden border-t border-gray-100"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-lime/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        <div className={`text-center mb-16 md:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-accent-violet-deep font-bold tracking-widest uppercase text-sm mb-4">Partner Benefits</h2>
          <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1f1633] mb-6">
            {t('benefitsTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-violet">{t('benefitsTitleHighlight')}</span>
          </h3>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            const isDark = benefit.bg !== "bg-[#f9fafb]";
            const isWide = benefit.colSpan.includes("col-span-2");
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-[2rem] p-8 flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[280px] h-full ${benefit.colSpan} ${benefit.bg} ${isWide ? 'justify-start' : 'justify-between'}`}
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125" />
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${isDark ? 'bg-white/10 text-white' : 'bg-accent-violet/10 text-accent-violet'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon size={28} />
                </div>
                
                <div className={`relative z-10 ${isWide ? '' : 'mt-auto'}`}>
                  <h4 className={`font-bold text-2xl mb-3 ${isDark ? 'text-white' : 'text-[#1f1633]'}`}>
                    {t(`benefitsList.${benefit.key}.title`)}
                  </h4>
                  <p className={`leading-relaxed text-[15px] ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
                    {t(`benefitsList.${benefit.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
