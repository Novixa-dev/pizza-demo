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
        pizza: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626", // Brand Red from design
          700: "#c8102e", // Deep Brand Red
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        brandRed: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#c8102e",
        },
        crust: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Golden Oven Crust
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        basil: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        stone: {
          850: "#1f1d1a",
          900: "#171614",
          950: "#0e0d0c",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
        },
        floatDelayed: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(-3deg)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(4deg)" },
        },
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "float-delayed": "floatDelayed 6.5s ease-in-out 1s infinite",
        "float-slow": "floatSlow 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
