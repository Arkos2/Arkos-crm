import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta ARKOS Principal — Fiel à Logo (Navy + Gold Champagne)
        arkos: {
          bg: "#0b0e14",
          surface: "#12151c",
          "surface-2": "#181c26",
          "surface-3": "#1d2233",
          border: "#1e2a3d",
          "border-2": "#263448",
          // Navy (extraído da logo — arco e texto)
          blue: "#1e3a5c",
          "blue-light": "#2b588a",
          "blue-dark": "#152d4a",
          "blue-glow": "rgba(30, 58, 92, 0.35)",
          // Gold Champagne (extraído dos ornamentos da logo)
          gold: "#C9A84C",
          "gold-light": "#d4b86a",
          "gold-dark": "#a78b3a",
          "gold-glow": "rgba(201, 168, 76, 0.3)",
          // Aliases legados (backward compat)
          text: "#F0F2F5",
          muted: "#5a6a82",
          card: "#12151c",
          accent: "#1e3a5c",
          "accent-light": "#2b588a",
        },
        // Texto
        text: {
          primary: "#F0F2F5",
          secondary: "#8892a4",
          muted: "#4a5568",
          inverse: "#0d1016",
        },
        // Status
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
          bg: "rgba(16, 185, 129, 0.1)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          bg: "rgba(245, 158, 11, 0.1)",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          bg: "rgba(239, 68, 68, 0.1)",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
          bg: "rgba(59, 130, 246, 0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      boxShadow: {
        "arkos-sm": "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        arkos: "0 4px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        "arkos-lg": "0 8px 32px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)",
        "arkos-glow-blue": "0 0 20px rgba(30, 58, 92, 0.4)",
        "arkos-glow-gold": "0 0 20px rgba(201, 168, 76, 0.3)",
        "card-hover":
          "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,58,92,0.3)",
      },
      backgroundImage: {
        "gradient-arkos":
          "linear-gradient(135deg, #12151c 0%, #181c26 50%, #12151c 100%)",
        "gradient-blue":
          "linear-gradient(135deg, #152d4a 0%, #1e3a5c 100%)",
        "gradient-gold":
          "linear-gradient(135deg, #a78b3a 0%, #C9A84C 100%)",
        "gradient-card":
          "linear-gradient(180deg, rgba(24,28,38,0.8) 0%, rgba(18,21,28,0.9) 100%)",
        "gradient-sidebar":
          "linear-gradient(180deg, #0b0e14 0%, #10131a 100%)",
        "noise": "url('/noise.png')",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 1s ease-in-out infinite",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(30, 58, 92, 0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(30, 58, 92, 0.8)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
