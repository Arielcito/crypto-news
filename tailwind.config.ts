import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        border: "var(--tertiary)",
        input: "var(--tertiary)",
        ring: "var(--primary)",
        background: "var(--tertiary)",
        foreground: "var(--secondary)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--tertiary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--tertiary)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--secondary)",
        },
        accent: {
          DEFAULT: "var(--primary)",
          foreground: "var(--tertiary)",
        },
        popover: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--secondary)",
        },
        card: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--secondary)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: { margin: 0 },
            h2: { margin: 0 },
            h3: { margin: 0 },
            h4: { margin: 0 },
            h5: { margin: 0 },
            h6: { margin: 0 },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
