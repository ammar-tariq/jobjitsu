import type { JSX, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type JjPageHeaderProps = {
  readonly title: string;
  readonly subtitle: string;
  /** Primary page action (e.g. New draft) — sits opposite the title. */
  readonly action?: ReactNode;
};

/** Section title + one calm sentence — one job per view. */
export function JjPageHeader({ title, subtitle, action }: JjPageHeaderProps): JSX.Element {
  return (
    <Stack spacing={0.75} component="header">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}
      >
        <Typography component="h2" variant="h2">
          {title}
        </Typography>
        {action ?? null}
      </Stack>
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
  /** Reading-width views stay left-aligned; omit for full-bleed list panes. */
  readonly maxWidth?: string;
  /** Primary page action (e.g. New draft opens an editor dialog). */
  readonly action?: ReactNode;
};

/** Shared main-column chrome. Does not call AI or send. */
export function JjPage({
  title,
  subtitle,
  testId,
  children,
  maxWidth,
  action,
}: JjPageProps): JSX.Element {
  return (
    <Stack
      spacing={2.5}
      data-testid={testId}
      sx={{ width: "100%", maxWidth: maxWidth ?? "none", minWidth: 0 }}
    >
      <JjPageHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </Stack>
  );
}
