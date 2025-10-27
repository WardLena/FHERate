import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: designTokens.colors.light.primary,
          hover: designTokens.colors.light.primaryHover,
          light: designTokens.colors.light.primaryLight,
        },
        secondary: {
          DEFAULT: designTokens.colors.light.secondary,
          hover: designTokens.colors.light.secondaryHover,
          light: designTokens.colors.light.secondaryLight,
        },
        accent: {
          DEFAULT: designTokens.colors.light.accent,
          hover: designTokens.colors.light.accentHover,
          light: designTokens.colors.light.accentLight,
        },
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.primary,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: designTokens.typography.sizes,
      spacing: {
        xs: designTokens.spacing.xs,
        sm: designTokens.spacing.sm,
        md: designTokens.spacing.md,
        lg: designTokens.spacing.lg,
        xl: designTokens.spacing.xl,
        '2xl': designTokens.spacing['2xl'],
        '3xl': designTokens.spacing['3xl'],
        '4xl': designTokens.spacing['4xl'],
      },
      borderRadius: {
        sm: designTokens.borderRadius.sm,
        md: designTokens.borderRadius.md,
        lg: designTokens.borderRadius.lg,
        xl: designTokens.borderRadius.xl,
      },
      boxShadow: {
        sm: designTokens.shadows.sm,
        md: designTokens.shadows.md,
        lg: designTokens.shadows.lg,
        xl: designTokens.shadows.xl,
      },
      transitionDuration: {
        fast: designTokens.transitions.fast,
        DEFAULT: designTokens.transitions.normal,
        slow: designTokens.transitions.slow,
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;

