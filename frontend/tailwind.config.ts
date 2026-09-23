import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F4C95D",
          hover: "#FFD978",
        },

        secondary: "#4C6FFF",
        neutral: "#7183A8",

        background: "#07152F",
        surface: "#0D2147",
        "surface-2": "#14305D",

        "text-primary": "#FFFFFF",
        "text-secondary": "#AAB9D6",

        border: "#263F6B",

        success: "#4FD18B",
        warning: "#F4C95D",
        error: "#FF6B6B",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "hero": ["80px", { lineHeight: "1", letterSpacing: "0.04em" }],
        "featured": ["48px", { lineHeight: "52px", letterSpacing: "0.03em" }],
        "section": ["28px", { lineHeight: "32px", letterSpacing: "0.05em" }],
        "card-title": ["16px", { lineHeight: "22px", fontWeight: "600" }],
      },
      backgroundImage: {
        "row-fade": "linear-gradient(90deg, #141414 0%, transparent 8%, transparent 92%, #141414 100%)",
        "hero-gradient": "linear-gradient(to bottom, transparent 30%, #141414 100%)",
        "card-overlay": "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
      },
      boxShadow: {
        "card": "0 2px 8px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.6)",
        "modal": "0 16px 64px rgba(0,0,0,0.8)",
        "player": "0 16px 64px rgba(0,0,0,0.8)",
      },
      borderRadius: {
        "sm": "2px",
        "DEFAULT": "4px",
        "md": "4px",
        "lg": "8px",
        "xl": "12px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      spacing: {
        "nav": "68px",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      zIndex: {
        "nav": "100",
        "modal": "200",
        "toast": "300",
      },
    },
  },
  plugins: [],
};
export default config;
