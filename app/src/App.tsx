import type { JSX } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { DesktopShell } from "./shell/DesktopShell.js";
import { HostProvider } from "./shell/HostProvider.js";
import { jjTheme } from "./theme/jjTheme.js";
import type { HostRuntime } from "./host/runtime.js";

export type AppProps = {
  readonly runtime: HostRuntime;
};

export function App({ runtime }: AppProps): JSX.Element {
  return (
    <ThemeProvider theme={jjTheme}>
      <CssBaseline />
      <HostProvider runtime={runtime}>
        <DesktopShell />
      </HostProvider>
    </ThemeProvider>
  );
}
