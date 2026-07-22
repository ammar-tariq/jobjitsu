import type { JSX } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type ComingSoonViewProps = {
  readonly title: string;
};

/** Placeholder main pane — proves shell routing without product features. */
export function ComingSoonView({ title }: ComingSoonViewProps): JSX.Element {
  return (
    <Stack spacing={1.5} data-testid="jj-coming-soon" sx={{ maxWidth: "40rem" }}>
      <Typography component="h2" variant="h2">
        {title}
      </Typography>
      <Typography color="text.secondary">Coming Soon</Typography>
    </Stack>
  );
}
