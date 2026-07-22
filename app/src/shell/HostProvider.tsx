import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import type { HostActivityEntry, HostRuntime } from "../host/runtime.js";

export type HostUiContextValue = {
  readonly activity: readonly HostActivityEntry[];
};

const HostUiContext = createContext<HostUiContextValue | null>(null);

/**
 * UI-facing host bridge — activity + subscriptions only.
 * Deliberately does not expose AiProvider.
 */
export function HostProvider(props: {
  readonly runtime: HostRuntime;
  readonly children: ReactNode;
}): JSX.Element {
  const [activity, setActivity] = useState<readonly HostActivityEntry[]>(
    props.runtime.getActivity(),
  );

  useEffect(() => {
    return props.runtime.subscribeActivity(setActivity);
  }, [props.runtime]);

  return <HostUiContext.Provider value={{ activity }}>{props.children}</HostUiContext.Provider>;
}

export function useHostActivity(): readonly HostActivityEntry[] {
  const ctx = useContext(HostUiContext);
  if (!ctx) {
    throw new Error("useHostActivity requires HostProvider");
  }
  return ctx.activity;
}
