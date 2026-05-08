/* src/theme/theme.js
 * Single source of truth for all design tokens.
 * Import this wherever you need colors, spacing, etc.
 * Generated from the Stitch "Financial Precision AI" design system.
 */

const theme = {
  colors: {
    // Backgrounds — tonal layering
    bg: "#0D1117",
    surface: "#161B22",
    surfaceHigh: "#1C2128",

    // Borders
    border: "#30363D",
    borderHover: "rgba(232, 93, 4, 0.3)",

    // Primary accent — orange
    primary: "#E85D04",
    primaryHover: "#C94E03",
    primaryMuted: "rgba(232, 93, 4, 0.12)",

    // Text
    textPrimary: "#F0F6FC",
    textSecondary: "#8B949E",
    textPlaceholder: "#484F58",

    // Semantic
    success: "#3FB950",
    successMuted: "rgba(63, 185, 80, 0.12)",
    warning: "#D29922",
    warningMuted: "rgba(210, 153, 34, 0.12)",
    error: "#F85149",
    errorMuted: "rgba(248, 81, 73, 0.12)",
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    sizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "24px",
      "2xl": "32px",
      "3xl": "48px",
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
    "2xl": "64px",
    containerMax: "1100px",
    gutter: "24px",
  },

  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },

  transitions: {
    fast: "0.15s ease",
    normal: "0.25s ease",
  },
};

export default theme;
