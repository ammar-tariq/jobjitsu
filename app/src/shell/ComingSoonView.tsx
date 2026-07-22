import type { JSX } from "react";

export type ComingSoonViewProps = {
  readonly title: string;
};

/** Placeholder main pane — proves shell routing without product features. */
export function ComingSoonView({ title }: ComingSoonViewProps): JSX.Element {
  return (
    <div className="jj-coming-soon" data-testid="jj-coming-soon">
      <h2 className="jj-coming-soon__title">{title}</h2>
      <p className="jj-coming-soon__body">Coming Soon</p>
    </div>
  );
}
