"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Building2, Shield, Users, TrendingUp, Briefcase, Server } from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS = [Globe, Building2, Shield, Users, TrendingUp, Briefcase];

export default function AnimatedInfrastructure() {
  const t = useTranslations("Landing");
  const [activeNode, setActiveNode] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-cycle through nodes
  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovering]);

  // Calculate node positions (Radius: 180px for desktop)
  const radius = 180;
  const nodes = ICONS.map((Icon, i) => {
    // Start at top (-90 degrees) and distribute 6 nodes evenly (60 degrees apart)
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, Icon, index: i };
  });

  return (
    <div 
      className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center bg-[#0a0514] rounded-[2rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Column: Interactive Infrastructure Network */}
      <div className="lg:col-span-7 relative h-[450px] md:h-[500px] flex items-center justify-center">
        
        {/* SVG Lines */}
        <svg 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
          width="400" 
          height="400" 
          viewBox="-200 -200 400 400" 
          style={{ zIndex: 0 }}
        >
          {nodes.map((node, i) => {
            const isActive = activeNode === i;
            return (
              <g key={`line-${i}`}>
                {/* Base Line */}
                <line
                  x1="0" y1="0" x2={node.x} y2={node.y}
                  stroke={isActive ? "rgba(250,127,170,0.5)" : "rgba(255,255,255,0.1)"}
                  strokeWidth={isActive ? "2" : "1"}
                  strokeDasharray={isActive ? "none" : "4,4"}
                  className="transition-colors duration-500"
                />
                {/* Animated Data Packet (Travels from center to node if active) */}
                {isActive && (
                  <motion.circle
                    r="4"
                    fill="#fa7faa"
                    initial={{ cx: 0, cy: 0, opacity: 0 }}
                    animate={{ cx: node.x, cy: node.y, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ filter: "drop-shadow(0 0 8px #fa7faa)" }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central Core Platform Node */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(106,95,193,0)', '0 0 50px rgba(106,95,193,0.6)', '0 0 0px rgba(106,95,193,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-accent-violet-deep to-accent-violet rounded-full flex flex-col items-center justify-center border-2 border-white/20 shadow-2xl"
          >
            <Server className="text-white w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{t('coreNode')}</span>
          </motion.div>
        </div>

        {/* Peripheral Infrastructure Nodes */}
        {nodes.map((node, i) => {
          const isActive = activeNode === i;
          const NodeIcon = node.Icon;
          
          return (
            <motion.div
              key={`node-${i}`}
              className="absolute z-10 cursor-pointer"
              style={{
                top: `calc(50% + ${node.y}px)`,
                left: `calc(50% + ${node.x}px)`,
                x: "-50%",
                y: "-50%"
              }}
              onClick={() => setActiveNode(i)}
            >
              <motion.div
                animate={{ scale: isActive ? 1.2 : 1 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                  isActive 
                    ? 'bg-accent-pink/20 border-accent-pink text-accent-pink shadow-[0_0_30px_rgba(250,127,170,0.4)]' 
                    : 'bg-[#1a1325] border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <NodeIcon size={24} />
              </motion.div>

              {/* Node Label (Hidden on small screens, shown globally) */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive ? 'text-white opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'
              }`}>
                {t(`companyItems.${i}.title`)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Column: Active Node Details */}
      <div className="lg:col-span-5 flex flex-col justify-center min-h-[250px] relative z-10">
        <h4 className="text-accent-pink font-bold tracking-widest uppercase text-sm mb-4">{t('infraPillar')} {activeNode + 1}</h4>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#110b1f] border border-white/10 rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Corner accent glow matching the active node */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-pink/20 rounded-full blur-[40px]" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-accent-pink/10 rounded-xl text-accent-pink">
                {(() => {
                  const ActiveIcon = nodes[activeNode].Icon;
                  return <ActiveIcon size={24} />;
                })()}
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
                {t(`companyItems.${activeNode}.title`)}
              </h3>
            </div>
            
            <p className="text-slate-300 text-lg leading-relaxed relative z-10">
              {t(`companyItems.${activeNode}.desc`)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Manual navigation dots below */}
        <div className="flex gap-3 mt-8">
          {nodes.map((_, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => setActiveNode(i)}
              className={`h-2 rounded-full transition-all duration-300 ${activeNode === i ? 'w-8 bg-accent-pink' : 'w-2 bg-white/20 hover:bg-white/40'}`}
              aria-label={`View pillar ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
