import { createTheme } from "@mui/material/styles";
import { jjDark, jjPrimitive } from "./jjColors.js";

/**
 * MUI theme from JobJitsu design tokens (THEME_DARK / tokens.css).
 * Layout from the Material dashboard template; palette is design-system only.
 * @see docs/design-system/THEME_DARK.md
 * @see packages/ui/src/tokens.css
 */
export const jjTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: jjDark.accent,
      light: jjDark.accentHover,
      dark: jjDark.accentPressed,
      contrastText: jjDark.textOnAccent,
    },
    secondary: {
      main: jjPrimitive.indigo800,
      light: jjDark.bgElevated,
      dark: jjDark.bgSurface,
      contrastText: jjDark.textPrimary,
    },
    background: {
      default: jjDark.bgCanvas,
      paper: jjDark.bgSurface,
    },
    text: {
      primary: jjDark.textPrimary,
      secondary: jjDark.textSecondary,
      disabled: jjDark.textTertiary,
    },
    divider: jjDark.borderSubtle,
    success: { main: jjDark.success },
    warning: { main: jjDark.caution },
    error: { main: jjDark.danger },
    info: { main: jjDark.accent },
    action: {
      hover: jjDark.bgMuted,
      selected: jjDark.accentMuted,
      disabled: jjDark.textTertiary,
      focus: jjDark.accent,
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
          backgroundColor: jjDark.bgCanvas,
          color: jjDark.textPrimary,
          WebkitFontSmoothing: "antialiased",
        },
        "#root": { height: "100%" },
        "::selection": {
          backgroundColor: jjDark.accentMuted,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: jjDark.bgSurface,
          borderRight: `1px solid ${jjDark.borderSubtle}`,
          color: jjDark.textPrimary,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          backgroundColor: jjDark.bgSurface,
          borderBottom: `1px solid ${jjDark.borderSubtle}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: jjDark.borderSubtle,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          color: jjDark.textSecondary,
          "&:hover": {
            backgroundColor: jjDark.bgMuted,
            color: jjDark.textPrimary,
          },
          "&.Mui-selected": {
            backgroundColor: jjDark.accentMuted,
            color: jjDark.accent,
            "&:hover": {
              backgroundColor: jjDark.accentMutedHover,
            },
            "& .MuiListItemIcon-root": {
              color: jjDark.accent,
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: jjDark.textSecondary,
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

export const DRAWER_WIDTH = 240;
