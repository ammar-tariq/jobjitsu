import { describe, expect, it, vi } from "vitest";
import { createInMemoryEventBus } from "./memory-bus.js";
import type { DurableEventSink } from "./bus.js";
import type { ApplicationId } from "@jobjitsu/shared";

describe("createInMemoryEventBus", () => {
  it("delivers matching events to subscribers in order", async () => {
    const bus = createInMemoryEventBus();
    const seen: string[] = [];

    bus.subscribe("Queue.Enqueued", (e) => {
      seen.push(`a:${e.payload.applicationId}`);
    });
    bus.subscribe("Queue.Enqueued", (e) => {
      seen.push(`b:${e.payload.applicationId}`);
    });

    const id = "app-1" as ApplicationId;
    await bus.publish("Queue.Enqueued", { applicationId: id });

    expect(seen).toEqual(["a:app-1", "b:app-1"]);
  });

  it("does not deliver to other event names", async () => {
    const bus = createInMemoryEventBus();
    const handler = vi.fn();
    bus.subscribe("Agent.Idle", handler);

    await bus.publish("Queue.Enqueued", {
      applicationId: "app-1" as ApplicationId,
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("subscribeAll receives every publish", async () => {
    const bus = createInMemoryEventBus();
    const names: string[] = [];
    bus.subscribeAll((e) => {
      names.push(e.name);
    });

    await bus.publish("Agent.Idle", {});
    await bus.publish("Queue.Cleared", {
      applicationId: "app-2" as ApplicationId,
    });

    expect(names).toEqual(["Agent.Idle", "Queue.Cleared"]);
  });

  it("unsubscribe stops delivery", async () => {
    const bus = createInMemoryEventBus();
    const handler = vi.fn();
    const unsub = bus.subscribe("Agent.Idle", handler);
    unsub();
    await bus.publish("Agent.Idle", {});
    expect(handler).not.toHaveBeenCalled();
  });

  it("persists durable events via optional sink (still local, no network)", async () => {
    const persisted: string[] = [];
    const sink: DurableEventSink = {
      persist(event) {
        persisted.push(event.name);
      },
    };
    const bus = createInMemoryEventBus({ durableSink: sink });

    await bus.publish("Agent.Idle", {});
    await bus.publish("Send.Attempted", {
      applicationId: "app-3" as ApplicationId,
      destinationClass: "file_export",
    });

    expect(persisted).toEqual(["Send.Attempted"]);
  });

  it("exposes no network APIs (in-memory only)", () => {
    const bus = createInMemoryEventBus();
    expect(Object.keys(bus).sort()).toEqual(["publish", "subscribe", "subscribeAll"]);
  });

  it("awaits async handlers so nested cascades stay ordered", async () => {
    const bus = createInMemoryEventBus();
    const seen: string[] = [];

    bus.subscribe("App.Started", async () => {
      seen.push("started-handler");
      await bus.publish("Plugin.Loaded", { pluginId: "p1" });
      seen.push("after-plugin");
    });
    bus.subscribe("Plugin.Loaded", async () => {
      seen.push("plugin-handler");
    });

    await bus.publish("App.Started", { version: "1" });

    expect(seen).toEqual(["started-handler", "plugin-handler", "after-plugin"]);
  });
});
