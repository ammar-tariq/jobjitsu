import type { JSX, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";

export type JjSurfaceProps = {
  readonly children: ReactNode;
  readonly testId?: string;
  readonly spacing?: number;
  readonly sx?: SxProps<Theme>;
};

/** Quiet panel — border + surface, no card stack theater. */
export function JjSurface({ children, testId, spacing = 1.5, sx }: JjSurfaceProps): JSX.Element {
  return (
    <Stack
      spacing={spacing}
      data-testid={testId}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}
