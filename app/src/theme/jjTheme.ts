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
      h2: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.33 },
      h3: { fontSize: "1.25rem", fontWeight: 500, letterSpacing: "-0.01em" },
      subtitle1: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.43 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.43 },
      button: { textTransform: "none", fontWeight: 500, fontSize: "0.875rem" },
    },
    shape: {
      borderRadius: 6,
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
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            minHeight: 32,
            borderRadius: 6,
          },
          sizeSmall: {
            minHeight: 28,
            paddingLeft: 12,
            paddingRight: 12,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: colors.bgMuted,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.borderDefault,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.accent,
            },
          },
          notchedOutline: {
            borderColor: colors.borderSubtle,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            height: 24,
            fontSize: "0.75rem",
            fontWeight: 500,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            backgroundColor: colors.accent,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            minHeight: 36,
            fontWeight: 500,
            fontSize: "0.875rem",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 6,
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
