import type { JSX, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type JjEmptyStateProps = {
  readonly title: string;
  readonly body: string;
  readonly testId?: string;
  readonly action?: ReactNode;
};

/** Invite the next step — no shame, one optional CTA. */
export function JjEmptyState({ title, body, testId, action }: JjEmptyStateProps): JSX.Element {
  return (
    <Stack spacing={0.75} data-testid={testId} sx={{ py: 1.5 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography color="text.secondary" variant="body2">
        {body}
      </Typography>
      {action}
    </Stack>
  );
}
