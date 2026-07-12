"use client";

import { useEffect, useRef, useState } from "react";

// Representative Mozambique government bond yield data
const yieldData = [
  { tenor: "3M", yield: 12.5, label: "3 Month" },
  { tenor: "6M", yield: 14.2, label: "6 Month" },
  { tenor: "1Y", yield: 15.8, label: "1 Year" },
  { tenor: "2Y", yield: 16.5, label: "2 Year" },
  { tenor: "3Y", yield: 17.1, label: "3 Year" },
  { tenor: "5Y", yield: 18.0, label: "5 Year" },
  { tenor: "10Y", yield: 19.25, label: "10 Year" },
];

// Chart dimensions
const CHART_W = 800;
const CHART_H = 350;
const PAD_LEFT = 60;
const PAD_RIGHT = 40;
const PAD_TOP = 40;
const PAD_BOTTOM = 50;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

// Scale helpers
const Y_MIN = 10;
const Y_MAX = 22;

function scaleX(index: number): number {
  return PAD_LEFT + (index / (yieldData.length - 1)) * PLOT_W;
}

function scaleY(value: number): number {
  return PAD_TOP + PLOT_H - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;
}

// Build the SVG path string from data points
function buildPath(): string {
  const points = yieldData.map((d, i) => ({ x: scaleX(i), y: scaleY(d.yield) }));

  // Smooth curve using cubic bezier
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
    path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

// Build the area fill path (closed below the curve)
function buildAreaPath(): string {
  const curvePath = buildPath();
  const lastPoint = yieldData.length - 1;
  const bottomRight = `L ${scaleX(lastPoint)} ${PAD_TOP + PLOT_H}`;
  const bottomLeft = `L ${PAD_LEFT} ${PAD_TOP + PLOT_H}`;
  return `${curvePath} ${bottomRight} ${bottomLeft} Z`;
}

export default function YieldCurveChart() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const curvePath = buildPath();
  const areaPath = buildAreaPath();

  // Y-axis tick marks
  const yTicks = [12, 14, 16, 18, 20];

  return (
    <section ref={ref} className="w-full py-16 md:py-24 relative z-20 overflow-hidden" style={{ backgroundColor: '#0a0514' }}>
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6a5fc1]/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1000px] mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-accent-violet font-bold tracking-widest uppercase text-sm mb-3">Market Overview</h2>
          <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Mozambique Yield Curve
          </h3>
          <p className="text-on-dark-muted text-base md:text-lg max-w-xl mx-auto">
            Representative government bond yields across maturities — powering fixed income opportunities.
          </p>
        </div>

        {/* Chart Container */}
        <div 
          className={`relative bg-[#110b1f] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-[0_0_60px_rgba(106,95,193,0.08)] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.2s' }}
        >
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradient for curve stroke */}
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6a5fc1" />
                <stop offset="50%" stopColor="#c2ef4e" />
                <stop offset="100%" stopColor="#fa7faa" />
              </linearGradient>

              {/* Gradient for area fill */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6a5fc1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6a5fc1" stopOpacity="0" />
              </linearGradient>

              {/* Glow filter for data points */}
              <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  y1={scaleY(tick)}
                  x2={CHART_W - PAD_RIGHT}
                  y2={scaleY(tick)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD_LEFT - 12}
                  y={scaleY(tick) + 4}
                  fill="rgba(255,255,255,0.35)"
                  fontSize="12"
                  fontFamily="system-ui, sans-serif"
                  textAnchor="end"
                >
                  {tick}%
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {yieldData.map((d, i) => (
              <text
                key={d.tenor}
                x={scaleX(i)}
                y={CHART_H - 12}
                fill="rgba(255,255,255,0.45)"
                fontSize="13"
                fontFamily="system-ui, sans-serif"
                textAnchor="middle"
                fontWeight="500"
              >
                {d.tenor}
              </text>
            ))}

            {/* Area fill under curve */}
            <path
              d={areaPath}
              fill="url(#areaGradient)"
              className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '1.2s' }}
            />

            {/* Main curve line with draw animation */}
            <path
              d={curvePath}
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isVisible ? 'yield-curve-draw' : ''}
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: isVisible ? 0 : 1200,
                transition: 'stroke-dashoffset 2s ease-in-out',
              }}
            />

            {/* Data points */}
            {yieldData.map((d, i) => {
              const cx = scaleX(i);
              const cy = scaleY(d.yield);
              const isHovered = hoveredIndex === i;

              return (
                <g
                  key={d.tenor}
                  className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${1.0 + i * 0.15}s` }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Outer glow ring */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 14 : 10}
                    fill="none"
                    stroke="#c2ef4e"
                    strokeWidth="1"
                    opacity={isHovered ? 0.5 : 0.2}
                    className="transition-all duration-300 animate-glow-pulse"
                  />

                  {/* Inner dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    fill="#c2ef4e"
                    filter="url(#dotGlow)"
                    className="transition-all duration-300 cursor-pointer"
                  />

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={cx - 42}
                        y={cy - 40}
                        width="84"
                        height="28"
                        rx="6"
                        fill="#1a1325"
                        stroke="rgba(106,95,193,0.4)"
                        strokeWidth="1"
                      />
                      <text
                        x={cx}
                        y={cy - 22}
                        textAnchor="middle"
                        fill="#c2ef4e"
                        fontSize="13"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                      >
                        {d.label}: {d.yield}%
                      </text>
                    </g>
                  )}

                  {/* Persistent yield label below dot (non-hovered) */}
                  {!isHovered && (
                    <text
                      x={cx}
                      y={cy + 22}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="11"
                      fontFamily="system-ui, sans-serif"
                      fontWeight="500"
                    >
                      {d.yield}%
                    </text>
                  )}

                  {/* Invisible hover hitbox */}
                  <circle cx={cx} cy={cy} r={20} fill="transparent" className="cursor-pointer" />
                </g>
              );
            })}

            {/* Y-axis line */}
            <line
              x1={PAD_LEFT}
              y1={PAD_TOP}
              x2={PAD_LEFT}
              y2={PAD_TOP + PLOT_H}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />

            {/* X-axis line */}
            <line
              x1={PAD_LEFT}
              y1={PAD_TOP + PLOT_H}
              x2={CHART_W - PAD_RIGHT}
              y2={PAD_TOP + PLOT_H}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          </svg>

          {/* Bottom stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-6 pt-6 border-t border-white/5">
            <div className="text-center">
              <p className="text-accent-lime text-xl md:text-2xl font-bold">19.25%</p>
              <p className="text-on-dark-muted text-xs uppercase tracking-widest mt-1">10Y Yield</p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-white text-xl md:text-2xl font-bold">7</p>
              <p className="text-on-dark-muted text-xs uppercase tracking-widest mt-1">Maturities</p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-accent-pink text-xl md:text-2xl font-bold">MZN</p>
              <p className="text-on-dark-muted text-xs uppercase tracking-widest mt-1">Currency</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
