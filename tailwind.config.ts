import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#050508",
          soft: "#09090f",
          raised: "#0e0e17",
          border: "rgba(168, 85, 247, 0.25)",
        },
        violet: {
          DEFAULT: "#8e24d8",
          bright: "#a855f7",
          deep: "#3d0966",
        },
        fog: {
          DEFAULT: "#f5f5f5",
          muted: "#a5a5ad",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
        brush: ["var(--font-brush)", "cursive"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(168, 85, 247, 0.45)",
        "glow-sm": "0 0 20px -6px rgba(168, 85, 247, 0.4)",
        card: "0 20px 50px -20px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "violet-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(142,36,216,0.18) 0%, rgba(5,5,8,0) 70%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease both",
        "slide-up": "slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
