import type { Config } from "tailwindcss"

const config: Config = {

  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        heading: ["var(--font-geist)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // ── sanjog design-system palette ──────────────────────────────
        brand: {
          DEFAULT: "#7D54FF", // Primary purple
          dark: "#6840E0",    // Pressed / button drop-shadow
          soft: "#EAE4FF",    // Tints, chips, borders
        },
        success: "#22C55E", // Correct answers, positive feedback
        gold: "#FFC83D",    // XP, rewards, streaks
        coral: "#FF7A59",   // Challenges, featured, limited-time
        sky: "#5EC8FF",     // Community, info, hints
        pink: "#FF82C3",    // Special achievements, accents
        bg: "#FAF7FF",      // Page background
        surface: "#FFFFFF", // Cards/containers
        ink: "#2D1B69",     // Text primary
        "ink-soft": "#625D77", // Text secondary — AA on white and page background
      },
      // Radius scale comes from Tailwind v4 defaults (see globals.css):
      // md 6px · lg 8px controls · xl 12px panels · 2xl 16px · 3xl 24px media.
      boxShadow: {
        card: "0 8px 24px rgba(125,84,255,0.08)",
        "card-hover": "0 12px 32px rgba(125,84,255,0.12)",
        achievement: "0 16px 40px rgba(255,200,61,0.25)",
        btn: "0 6px 0 #6840E0",
        "btn-success": "0 6px 0 #16A34A",
        "btn-gold": "0 6px 0 #E0A91F",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Add more custom animations here
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        shake: "shake 0.4s ease-in-out",
        // Add more animations here
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
}

export default config
