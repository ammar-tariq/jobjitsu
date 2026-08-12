import type { JSX, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type JjPageHeaderProps = {
  readonly title: string;
  readonly subtitle: string;
};

/** Section title + one calm sentence — one job per view. */
export function JjPageHeader({ title, subtitle }: JjPageHeaderProps): JSX.Element {
  return (
    <Stack spacing={0.75} component="header">
      <Typography component="h2" variant="h2">
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {subtitle}
      </Typography>
    </Stack>
  );
}

export type JjPageProps = {
  readonly title: string;
  readonly subtitle: string;
  readonly testId: string;
  readonly children: ReactNode;
  /** Reading-width views stay left-aligned; omit for full-bleed split panes. */
  readonly maxWidth?: string;
};

/** Shared main-column chrome. Does not call AI or send. */
export function JjPage({ title, subtitle, testId, children, maxWidth }: JjPageProps): JSX.Element {
  return (
    <Stack
      spacing={2.5}
      data-testid={testId}
      sx={{ width: "100%", maxWidth: maxWidth ?? "none", minWidth: 0 }}
    >
      <JjPageHeader title={title} subtitle={subtitle} />
      {children}
    </Stack>
  );
}
