import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-rubik)", "system-ui", "sans-serif"],
        display: ["var(--font-rubik)", "system-ui", "sans-serif"],
        mono: ["Monaco", "Menlo", "Ubuntu Mono", "monospace"],
      },
      colors: {
        // Brand & Accent
        primary: "#150f23",
        "ink-deep": "#1f1633",
        "on-primary": "#ffffff",
        "accent-lime": "#c2ef4e",
        "accent-pink": "#fa7faa",
        "accent-violet": "#6a5fc1",
        "accent-violet-deep": "#422082",
        "accent-violet-mid": "#79628c",
        // Surface
        "surface-canvas-dark": "#1f1633",
        "surface-canvas-light": "#ffffff",
        "surface-night": "#150f23",
        "surface-press-light": "#f0f0f0",
        "surface-press-stronger": "#efefef",
        "hairline-violet": "#362d59",
        "hairline-cool": "#cfcfdb",
        "hairline-cloud": "#e5e7eb",
        // Text
        ink: "#1f1633",
        "ink-press": "#1a1a1a",
        "on-dark-muted": "rgba(255,255,255,0.72)",
        "on-dark-faint": "rgba(255,255,255,0.18)",
        // Semantic
        "ring-focus": "rgba(59,130,246,0.5)",
      },
      boxShadow: {
        "level-1": "0 2px 8px 0 rgba(0,0,0,0.08)",
        "level-2": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        "level-3": "0 0 8px 6px rgb(21,15,35)",
        "level-4": "0 0.5rem 1.5rem rgba(0,0,0,0.18)",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        xxl: "18px",
      },
      letterSpacing: {
        console: "0.2px",
      }
    },
  },
  plugins: [],
};
export default config;
