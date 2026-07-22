import type { AgentPrivacyState } from "@jobjitsu/ui";
import type { AiStatusSnapshot } from "../ipc/commands.js";

/**
 * Map host AI status into privacy chrome — never claim On-device for remote.
 */
export function agentPrivacyStateFromStatus(status: AiStatusSnapshot): AgentPrivacyState {
  if (!status.ready || status.locality === "unavailable") {
    return "unavailable";
  }
  if (status.locality === "local") {
    return "on-device";
  }
  return "ready";
}
