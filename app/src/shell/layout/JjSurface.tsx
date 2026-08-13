import type { JSX, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";

export type JjSurfaceProps = {
  readonly children: ReactNode;
  readonly testId?: string;
  readonly id?: string;
  readonly spacing?: number;
  readonly sx?: SxProps<Theme>;
};

/** Card panel — glass on macOS, opaque lift on Linux/Windows. */
export function JjSurface({
  children,
  testId,
  id,
  spacing = 1.5,
  sx,
}: JjSurfaceProps): JSX.Element {
  return (
    <Stack
      id={id}
      spacing={spacing}
      data-testid={testId}
      className="jj-card"
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "var(--jj-radius-lg)",
        bgcolor: "var(--jj-color-bg-card)",
        boxShadow: "var(--jj-shadow-sm)",
        backdropFilter: "var(--jj-card-blur)",
        minWidth: 0,
        transition:
          "transform var(--jj-motion-duration-fast) var(--jj-motion-ease-out), box-shadow var(--jj-motion-duration-fast) var(--jj-motion-ease-out)",
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}
