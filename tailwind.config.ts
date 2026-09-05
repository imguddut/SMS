import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Academic Intelligence Tokens
        surface: {
          DEFAULT: "#faf8ff",
          dim: "#d9d9e4",
          bright: "#faf8ff",
          variant: "#e1e1ed",
          container: {
            lowest: "#ffffff",
            low: "#f3f3fe",
            DEFAULT: "#ededf8",
            high: "#e7e7f3",
            highest: "#e1e1ed",
          },
          tint: "#535e7a",
        },
        "on-surface": {
          DEFAULT: "#191b23",
          variant: "#45464d",
        },
        "inverse-surface": "#2e3039",
        "inverse-on-surface": "#f0f0fb",
        primary: {
          DEFAULT: "#00061d",
          container: "#141f38",
          fixed: "#d9e2ff",
          "fixed-dim": "#bbc6e7",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#7c87a5",
          fixed: "#101b34",
          "fixed-variant": "#3c4661",
        },
        "inverse-primary": "#bbc6e7",
        secondary: {
          DEFAULT: "#795902",
          container: "#fdd275",
          fixed: "#ffdf9e",
          "fixed-dim": "#ebc166",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#775800",
          fixed: "#261a00",
          "fixed-variant": "#5b4300",
        },
        tertiary: {
          DEFAULT: "#00061d",
          container: "#0c1e43",
          fixed: "#dae2ff",
          "fixed-dim": "#b6c6f4",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#7786b1",
          fixed: "#071a3f",
          "fixed-variant": "#36466d",
        },
        outline: {
          DEFAULT: "#76777e",
          variant: "#c6c6ce",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#93000a",
        },
        background: "#faf8ff",
        "on-background": "#191b23",
        // Semantic Editorial Accents
        institutional: {
          gold: "#C9A24B",
          "gold-deep": "#9C7A32",
          "gold-light": "#FDD275",
          navy: "#141F38",
          "navy-dark": "#00061D",
          "navy-slate": "#26365C",
          charcoal: "#1C1E26",
          parchment: "#FAFAF7",
          border: "#E8E7E1",
          success: "#3D5B42",
          warning: "#7A521E",
          critical: "#752D20",
        },
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Newsreader", "serif"],
        sans: ["var(--font-public-sans)", "Public Sans", "sans-serif"],
        display: ["var(--font-newsreader)", "Newsreader", "serif"],
        mono: ["var(--font-public-sans)", "Public Sans", "monospace"],
      },
      spacing: {
        "3xs": "0.125rem",
        "2xs": "0.25rem",
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
        "4xl": "4rem",
        "sidebar-w": "17.5rem",
        "sidebar-collapsed-w": "4.5rem",
        "container-max": "88rem",
        "gutter-desktop": "1.5rem",
        "gutter-mobile": "1rem",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.625rem", // 10px standard controls
        lg: "0.875rem", // 14px standard cards/panels
        xl: "1.25rem",
        full: "9999px",
      },
      boxShadow: {
        academic: "0 1px 3px rgba(20, 31, 56, 0.04), 0 6px 16px -4px rgba(20, 31, 56, 0.03)",
        "academic-lift": "0 4px 6px -1px rgba(20, 31, 56, 0.06), 0 12px 24px -4px rgba(20, 31, 56, 0.08)",
        "academic-modal": "0 24px 48px -12px rgba(20, 31, 56, 0.18)",
        "gold-focus": "0 0 0 3px rgba(201, 162, 75, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
