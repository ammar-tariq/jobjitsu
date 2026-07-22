import { createTheme } from "@mui/material/styles";

/**
 * MUI theme mapped to JobJitsu design tokens (Midnight Ink + Electric Teal).
 * Layout pattern inspired by the Material UI dashboard template; colors stay on-brand.
 * @see docs/design-system/THEME_DARK.md
 * @see https://github.com/mui/material-ui/tree/v9.2.0/docs/data/material/getting-started/templates/dashboard
 */
export const jjTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#2dd4bf",
      light: "#5eead4",
      dark: "#14b8a6",
      contrastText: "#0b0a1a",
    },
    secondary: {
      main: "#312e81",
      light: "#25224f",
      dark: "#1e1b4b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0b0a1a",
      paper: "#1e1b4b",
    },
    text: {
      primary: "#ffffff",
      secondary: "#64748b",
    },
    divider: "rgba(255, 255, 255, 0.06)",
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#f43f5e" },
    info: { main: "#2dd4bf" },
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
          backgroundColor: "#0b0a1a",
          WebkitFontSmoothing: "antialiased",
        },
        "#root": { height: "100%" },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "&.Mui-selected": {
            backgroundColor: "rgba(45, 212, 191, 0.15)",
            color: "#2dd4bf",
            "&:hover": {
              backgroundColor: "rgba(45, 212, 191, 0.22)",
            },
            "& .MuiListItemIcon-root": {
              color: "#2dd4bf",
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: "#64748b",
        },
      },
    },
  },
});

export const DRAWER_WIDTH = 240;
