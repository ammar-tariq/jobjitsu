import { useEffect, useState } from "react";

/** Window-width layout — docs/design-system/RESPONSIVE.md */
export type ShellLayout = "compact" | "standard" | "wide";

export const SHELL_COMPACT_MAX = 1023;
export const SHELL_WIDE_MIN = 1440;
export const COMPACT_DRAWER_WIDTH = 64;

export function layoutFromWidth(width: number): ShellLayout {
  if (width < 1024) {
    return "compact";
  }
  if (width >= SHELL_WIDE_MIN) {
    return "wide";
  }
  return "standard";
}

/**
 * Subscribe to window width for sidebar density. Defaults to standard in non-window hosts.
 */
export function useShellLayout(): ShellLayout {
  const [layout, setLayout] = useState<ShellLayout>(() =>
    typeof window === "undefined" ? "standard" : layoutFromWidth(window.innerWidth),
  );

  useEffect(() => {
    const onResize = (): void => {
      setLayout(layoutFromWidth(window.innerWidth));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return layout;
}
