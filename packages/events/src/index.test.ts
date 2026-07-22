import { describe, expect, it } from "vitest";
import { DURABLE_EVENT_NAMES, EVENT_NAMES, PACKAGE_NAME } from "./index.js";
import type { EventBus } from "./index.js";

describe("@jobjitsu/events", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/events");
  });

  it("includes egress events in durable set", () => {
    expect(EVENT_NAMES).toContain("Send.Attempted");
    expect(DURABLE_EVENT_NAMES).toContain("Send.Succeeded");
    expect(DURABLE_EVENT_NAMES).toContain("Send.Unknown");
  });

  it("types EventBus without providing an implementation", () => {
    const keys: Array<keyof EventBus> = ["publish", "subscribe", "subscribeAll"];
    expect(keys).toHaveLength(3);
  });
});
