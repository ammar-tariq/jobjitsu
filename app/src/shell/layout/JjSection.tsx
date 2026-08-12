import type { JSX, ReactNode } from "react";
import Typography from "@mui/material/Typography";
import { JjSurface } from "./JjSurface.js";

export type JjSectionProps = {
  readonly title: string;
  readonly description?: string;
  readonly testId?: string;
  readonly children: ReactNode;
};

/** Grouped settings or workspace block — one topic, no cockpit of cards. */
export function JjSection({ title, description, testId, children }: JjSectionProps): JSX.Element {
  return (
    <JjSurface testId={testId}>
      <Typography component="h3" variant="subtitle2">
        {title}
      </Typography>
      {description ? (
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      ) : null}
      {children}
    </JjSurface>
  );
}
