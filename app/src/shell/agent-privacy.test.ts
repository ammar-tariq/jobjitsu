import { describe, expect, it } from "vitest";
import { agentPrivacyStateFromStatus } from "./agent-privacy.js";

describe("agentPrivacyStateFromStatus", () => {
  it("stays unavailable until ready", () => {
    expect(agentPrivacyStateFromStatus({ ready: false, locality: "local" })).toBe("unavailable");
    expect(agentPrivacyStateFromStatus({ ready: false, locality: "unavailable" })).toBe(
      "unavailable",
    );
  });

  it("uses On-device only for local ready", () => {
    expect(agentPrivacyStateFromStatus({ ready: true, locality: "local" })).toBe("on-device");
  });

  it("never claims On-device for remote ready", () => {
    expect(agentPrivacyStateFromStatus({ ready: true, locality: "remote" })).toBe("ready");
  });
});
