import { createTheme, type Theme } from "@mui/material/styles";
import { jjSemanticFor, type AppearanceMode, type JjSemanticColors } from "./jjColors.js";

function buildTheme(mode: AppearanceMode, colors: JjSemanticColors): Theme {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.accent,
        light: colors.accentHover,
        dark: colors.accentPressed,
        contrastText: colors.textOnAccent,
      },
      secondary: {
        main: mode === "dark" ? "#312E81" : "#1E1B4B",
        light: colors.bgElevated,
        dark: colors.bgSurface,
        contrastText: colors.textPrimary,
      },
      background: {
        default: colors.bgCanvas,
        paper: colors.bgSurface,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
        disabled: colors.textTertiary,
      },
      divider: colors.borderSubtle,
      success: { main: colors.success },
      warning: { main: colors.caution },
      error: { main: colors.danger },
      info: { main: colors.accent },
      action: {
        hover: colors.bgMuted,
        selected: colors.accentMuted,
        disabled: colors.textTertiary,
        focus: colors.accent,
      },
    },
    typography: {
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      h1: { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
      h2: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.015em" },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.43 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { height: "100%" },
          body: {
            height: "100%",
            margin: 0,
            backgroundColor: colors.bgCanvas,
            color: colors.textPrimary,
            WebkitFontSmoothing: "antialiased",
          },
          "#root": { height: "100%" },
          "::selection": {
            backgroundColor: colors.accentMuted,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: colors.bgSurface,
            borderRight: `1px solid ${colors.borderSubtle}`,
            color: colors.textPrimary,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: "none",
            backgroundColor: colors.bgSurface,
            borderBottom: `1px solid ${colors.borderSubtle}`,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.borderSubtle,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            color: colors.textSecondary,
            "&:hover": {
              backgroundColor: colors.bgMuted,
              color: colors.textPrimary,
            },
            "&.Mui-selected": {
              backgroundColor: colors.accentMuted,
              color: colors.accent,
              "&:hover": {
                backgroundColor: colors.accentMutedHover,
              },
              "& .MuiListItemIcon-root": {
                color: colors.accent,
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 36,
            color: colors.textSecondary,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: "inherit",
          },
        },
      },
    },
  });
}

/** Build MUI theme from JobJitsu design tokens. Dark is the product default. */
export function createJjTheme(mode: AppearanceMode = "dark"): Theme {
  return buildTheme(mode, jjSemanticFor(mode));
}

/** Default dark theme — Midnight Ink canvas. */
export const jjTheme = createJjTheme("dark");

export const DRAWER_WIDTH = 240;
