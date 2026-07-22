/**
 * JobJitsu color primitives — mirror of packages/ui tokens.css / DESIGN_TOKENS.md.
 * Prefer semantic aliases below in UI; keep hex only here for MUI createTheme.
 */
export const jjPrimitive = {
  indigo950: "#0B0A1A", // Midnight Ink
  indigo900: "#1E1B4B", // Deep Indigo
  indigo800: "#312E81",
  elevated: "#25224F",
  teal400: "#2DD4BF", // Electric Teal (dark accent)
  teal300: "#5EEAD4", // accent-hover (dark)
  teal500: "#14B8A6", // accent-pressed / light accent / AA body teal
  teal600: "#0D9488",
  white: "#FFFFFF",
  cloud50: "#F8FAFC", // Soft Cloud
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate400: "#94A3B8", // text tertiary
  slate500: "#64748B", // text secondary
  slate800: "#1E293B", // light text primary
  jade500: "#10B981",
  jade600: "#059669",
  amber500: "#F59E0B",
  amber600: "#D97706",
  rose500: "#F43F5E",
  rose600: "#E11D48",
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

/** Light-theme semantic map — THEME_LIGHT.md (opt-in, not default). */
export const jjLight = {
  bgCanvas: jjPrimitive.cloud50,
  bgSurface: jjPrimitive.white,
  bgElevated: jjPrimitive.white,
  bgMuted: jjPrimitive.slate100,
  textPrimary: jjPrimitive.slate800,
  textSecondary: jjPrimitive.slate500,
  textTertiary: jjPrimitive.slate400,
  textOnAccent: jjPrimitive.indigo950,
  borderSubtle: "rgba(15, 23, 42, 0.06)",
  borderDefault: jjPrimitive.slate200,
  accent: jjPrimitive.teal500,
  accentHover: jjPrimitive.teal400,
  accentPressed: jjPrimitive.teal600,
  accentMuted: "rgba(20, 184, 166, 0.12)",
  accentMutedHover: "rgba(20, 184, 166, 0.2)",
  success: jjPrimitive.jade600,
  caution: jjPrimitive.amber600,
  danger: jjPrimitive.rose600,
} as const;

export type JjSemanticColors = typeof jjDark | typeof jjLight;

export type AppearanceMode = "dark" | "light";

export function jjSemanticFor(mode: AppearanceMode): JjSemanticColors {
  return mode === "light" ? jjLight : jjDark;
}
