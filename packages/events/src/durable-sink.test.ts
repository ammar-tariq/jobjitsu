import { describe, expect, it } from "vitest";
import type { ApplicationId } from "@jobjitsu/shared";
import {
  DURABLE_ALLOWLIST_REQUIREMENTS,
  DURABLE_EVENT_NAMES,
  createInMemoryEventBus,
  createMemoryDurableEventSink,
  durableAllowlistCoversRequirements,
  isDurableEventName,
} from "./index.js";

describe("durable event hook (PE02-S03)", () => {
  it("covers egress, approval, pause, and prefs in the allowlist", () => {
    expect(durableAllowlistCoversRequirements()).toBe(true);
    expect(DURABLE_ALLOWLIST_REQUIREMENTS.egress).toEqual(
      expect.arrayContaining(["Send.Attempted", "Privacy.EgressRecorded"]),
    );
    expect(DURABLE_ALLOWLIST_REQUIREMENTS.approval).toEqual(
      expect.arrayContaining(["Queue.Approved", "Queue.Rejected"]),
    );
    expect(DURABLE_ALLOWLIST_REQUIREMENTS.pause).toContain("Agent.Paused");
    expect(DURABLE_ALLOWLIST_REQUIREMENTS.prefs).toContain("Preferences.Changed");

    for (const name of DURABLE_EVENT_NAMES) {
      expect(isDurableEventName(name)).toBe(true);
    }
    expect(isDurableEventName("Agent.Idle")).toBe(false);
  });

  it("invokes the memory sink for Send.Attempted (sample durable event)", async () => {
    const sink = createMemoryDurableEventSink();
    const bus = createInMemoryEventBus({ durableSink: sink });

    await bus.publish("Agent.Idle", {});
    await bus.publish("Send.Attempted", {
      applicationId: "app_durable" as ApplicationId,
      destinationClass: "mail",
    });
    await bus.publish("Preferences.Changed", { keys: ["theme"] });

    const names = sink.events().map((e) => e.name);
    expect(names).toEqual(["Send.Attempted", "Preferences.Changed"]);
    expect(sink.events()[0]?.payload).toEqual({
      applicationId: "app_durable",
      destinationClass: "mail",
    });
  });

  it("does not persist non-allowlisted events", async () => {
    const sink = createMemoryDurableEventSink();
    const bus = createInMemoryEventBus({ durableSink: sink });

    await bus.publish("Discovery.RolesFound", { sourceId: "csv", count: 3 });
    expect(sink.events()).toHaveLength(0);
  });

  it("keeps the memory sink local (no network surface)", () => {
    const sink = createMemoryDurableEventSink();
    expect(Object.keys(sink).sort()).toEqual(["clear", "events", "persist"]);
  });
});
