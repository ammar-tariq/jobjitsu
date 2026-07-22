import type { JSX } from "react";

/**
 * Honest Agent privacy chrome states.
 * Never use “Local LLM” — and never claim On-device for a remote provider.
 */
export type AgentPrivacyState = "unavailable" | "on-device" | "ready";

export type JjAgentPrivacyPillProps = {
  /** Derived from host ai status / Ai.* events. Default: unavailable (calm). */
  readonly state?: AgentPrivacyState;
  /** Override label — tests / advanced chrome only. */
  readonly label?: string;
};

export function labelForAgentPrivacy(state: AgentPrivacyState): string {
  switch (state) {
    case "on-device":
      return "Agent · On-device";
    case "ready":
      return "Agent · Ready";
    case "unavailable":
      return "Agent · Unavailable";
  }
}

/**
 * Presentational privacy chrome — Agent wording only (never “LLM” in UI).
 */
export function JjAgentPrivacyPill({
  state = "unavailable",
  label,
}: JjAgentPrivacyPillProps): JSX.Element {
  const text = label ?? labelForAgentPrivacy(state);
  return (
    <span
      className="jj-agent-privacy-pill"
      role="status"
      aria-label={text}
      data-testid="jj-agent-privacy-pill"
      data-state={state}
    >
      {text}
    </span>
  );
}
