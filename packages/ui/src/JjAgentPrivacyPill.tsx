import type { JSX } from "react";

export type JjAgentPrivacyPillProps = {
  /** Status label. Default reinforces local-first trust chrome. */
  readonly label?: string;
};

/**
 * Presentational privacy chrome — Agent · On-device (never “LLM” in UI).
 * Static for Desktop Foundation; health wiring comes later.
 */
export function JjAgentPrivacyPill({
  label = "Agent · On-device",
}: JjAgentPrivacyPillProps): JSX.Element {
  return (
    <span
      className="jj-agent-privacy-pill"
      role="status"
      aria-label={label}
      data-testid="jj-agent-privacy-pill"
    >
      {label}
    </span>
  );
}
