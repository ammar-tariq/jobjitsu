import type { JSX } from "react";
import { DesktopShell } from "./shell/DesktopShell.js";
import { HostProvider } from "./shell/HostProvider.js";
import type { HostRuntime } from "./host/runtime.js";

export type AppProps = {
  readonly runtime: HostRuntime;
};

export function App({ runtime }: AppProps): JSX.Element {
  return (
    <HostProvider runtime={runtime}>
      <DesktopShell />
    </HostProvider>
  );
}
