import { useEffect, useMemo, useState, type JSX } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { DesktopShell } from "./shell/DesktopShell.js";
import { HostProvider } from "./shell/HostProvider.js";
import { createJjTheme } from "./theme/jjTheme.js";
import type { HostRuntime } from "./host/runtime.js";
import type { ThemePreference } from "./ipc/commands.js";

export type AppProps = {
  readonly runtime: HostRuntime;
};

export function App({ runtime }: AppProps): JSX.Element {
  const [theme, setTheme] = useState<ThemePreference>("dark");
  const muiTheme = useMemo(() => createJjTheme(theme), [theme]);

  useEffect(() => {
    let cancelled = false;
    void runtime.bridge.getTheme().then((result) => {
      if (!cancelled && result.ok) {
        setTheme(result.value.theme);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [runtime]);

  const onThemeChange = (next: ThemePreference): void => {
    setTheme(next);
    void runtime.bridge.setTheme(next).then((result) => {
      if (result.ok) {
        setTheme(result.value.theme);
      }
    });
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <HostProvider runtime={runtime}>
        <DesktopShell theme={theme} onThemeChange={onThemeChange} bridge={runtime.bridge} />
      </HostProvider>
    </ThemeProvider>
  );
}
