/**
 * JobJitsu color primitives — mirror of packages/ui tokens.css / DESIGN_TOKENS.md.
 * Prefer semantic aliases below in UI; keep hex only here for MUI createTheme.
 */
export const jjPrimitive = {
  indigo950: "#0B0A1A", // Midnight Ink
  indigo900: "#1E1B4B", // Deep Indigo
  indigo800: "#312E81",
  elevated: "#25224F",
  teal400: "#2DD4BF", // Electric Teal
  teal300: "#5EEAD4", // accent-hover
  teal500: "#14B8A6", // accent-pressed / AA body teal
  teal600: "#0D9488",
  white: "#FFFFFF",
  cloud50: "#F8FAFC",
  slate400: "#94A3B8", // text tertiary
  slate500: "#64748B", // text secondary
  slate800: "#1E293B",
  jade500: "#10B981",
  amber500: "#F59E0B",
  rose500: "#F43F5E",
} as const;

/** Dark-theme semantic map — THEME_DARK.md */
export const jjDark = {
  bgCanvas: jjPrimitive.indigo950,
  bgSurface: jjPrimitive.indigo900,
  bgElevated: jjPrimitive.elevated,
  bgMuted: "rgba(255, 255, 255, 0.06)",
  textPrimary: jjPrimitive.white,
  textSecondary: jjPrimitive.slate500,
  textTertiary: jjPrimitive.slate400,
  textOnAccent: jjPrimitive.indigo950,
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderDefault: "rgba(255, 255, 255, 0.12)",
  accent: jjPrimitive.teal400,
  accentHover: jjPrimitive.teal300,
  accentPressed: jjPrimitive.teal500,
  accentMuted: "rgba(45, 212, 191, 0.15)",
  accentMutedHover: "rgba(45, 212, 191, 0.25)",
  success: jjPrimitive.jade500,
  caution: jjPrimitive.amber500,
  danger: jjPrimitive.rose500,
} as const;
