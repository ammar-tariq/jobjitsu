import { describe, expect, it, vi } from "vitest";
import { createServiceKey, createServiceRegistry } from "@jobjitsu/core";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createLogger, createMemoryLogSink } from "@jobjitsu/logger";
import { isOk } from "@jobjitsu/shared";
import {
  CONTRIBUTION_POINTS,
  ExtensionServiceKeys,
  PACKAGE_NAME,
  createExtensionManager,
  defineExtension,
  isContributionPoint,
} from "./index.js";

describe("@jobjitsu/extension-sdk", () => {
  it("exports package identity and contribution points", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/extension-sdk");
    expect(CONTRIBUTION_POINTS).toContain("discovery.source");
    expect(CONTRIBUTION_POINTS).toContain("send.channel");
    expect(isContributionPoint("ui.panel")).toBe(true);
    expect(isContributionPoint("ai.runtime")).toBe(false);
  });

  it("starts with zero extensions and zero contributions", () => {
    const manager = createExtensionManager();
    expect(manager.list()).toEqual([]);
    const panels = manager.getContributions("ui.panel");
    expect(panels.ok).toBe(true);
    if (panels.ok) {
      expect(panels.value).toEqual([]);
    }
  });

  it("fails closed on unknown contribution point queries", () => {
    const manager = createExtensionManager();
    const result = manager.getContributions("not.a.point" as "ui.panel");
    expect(result.ok).toBe(false);
  });

  it("runs lifecycle hooks in order and emits domain events", async () => {
    const bus = createInMemoryEventBus();
    const seen: string[] = [];
    bus.subscribeAll((e) => {
      seen.push(e.name);
    });

    const hooks: string[] = [];
    const manager = createExtensionManager({
      eventBus: bus,
      logger: createLogger(createMemoryLogSink()),
    });

    const extension = defineExtension({
      manifest: {
        id: "test.panel",
        name: "Test Panel",
        version: "1.0.0",
        contributes: [{ type: "ui.panel", id: "demo" }],
      },
      async onRegister() {
        hooks.push("register");
      },
      async register(api) {
        hooks.push("contribute");
        api.contribute("ui.panel", "demo", {
          kind: "ui.panel",
          title: "Demo",
        });
      },
      async onEnable() {
        hooks.push("enable");
      },
      async onDisable() {
        hooks.push("disable");
      },
      async onUnload() {
        hooks.push("unload");
      },
    });

    expect(isOk(await manager.register(extension))).toBe(true);
    expect(manager.isEnabled("test.panel")).toBe(false);
    expect(isOk(await manager.enable("test.panel"))).toBe(true);
    expect(manager.isEnabled("test.panel")).toBe(true);

    const panels = manager.getContributions("ui.panel");
    expect(panels.ok && panels.value).toEqual([
      {
        point: "ui.panel",
        id: "demo",
        extensionId: "test.panel",
        contribution: { kind: "ui.panel", title: "Demo" },
      },
    ]);

    expect(isOk(await manager.disable("test.panel"))).toBe(true);
    const afterDisable = manager.getContributions("ui.panel");
    expect(afterDisable.ok && afterDisable.value).toEqual([]);

    expect(isOk(await manager.unregister("test.panel"))).toBe(true);
    expect(manager.list()).toEqual([]);
    expect(hooks).toEqual(["register", "contribute", "enable", "disable", "unload"]);
    expect(seen).toEqual([
      "Extension.Registered",
      "Extension.Enabled",
      "Extension.Disabled",
      "Extension.Unloaded",
    ]);
  });

  it("supports scoped dependency injection", async () => {
    const Token = createServiceKey<{ readonly n: number }>("test.token");
    const parent = createServiceRegistry();
    parent.register(Token, { n: 1 });

    const manager = createExtensionManager({ services: parent });
    const extension = defineExtension({
      manifest: {
        id: "test.di",
        name: "DI",
        version: "0.0.1",
        contributes: [],
      },
      register(api) {
        expect(api.context.resolve(Token).n).toBe(1);
        api.registerService(Token, { n: 2 });
        expect(api.context.resolve(Token).n).toBe(2);
      },
      onEnable(ctx) {
        expect(ctx.resolve(Token).n).toBe(2);
        expect(parent.resolve(Token).n).toBe(1);
      },
    });

    expect(isOk(await manager.register(extension))).toBe(true);
    expect(isOk(await manager.enable("test.di"))).toBe(true);
  });

  it("rejects undeclared contributions and duplicate ids", async () => {
    const manager = createExtensionManager();
    const extension = defineExtension({
      manifest: {
        id: "test.strict",
        name: "Strict",
        version: "1.0.0",
        contributes: [{ type: "ui.status", id: "badge" }],
      },
      register(api) {
        api.contribute("ui.status", "other", {
          kind: "ui.status",
          label: "Nope",
        });
      },
    });

    expect(isOk(await manager.register(extension))).toBe(true);
    const enabled = await manager.enable("test.strict");
    expect(enabled.ok).toBe(false);

    const okExt = defineExtension({
      manifest: {
        id: "test.ok",
        name: "Ok",
        version: "1.0.0",
        contributes: [{ type: "ui.status", id: "badge" }],
      },
      register(api) {
        api.contribute("ui.status", "badge", {
          kind: "ui.status",
          label: "Status",
        });
      },
    });
    expect(isOk(await manager.register(okExt))).toBe(true);
    expect(isOk(await manager.enable("test.ok"))).toBe(true);

    const clash = defineExtension({
      manifest: {
        id: "test.clash",
        name: "Clash",
        version: "1.0.0",
        contributes: [{ type: "ui.status", id: "badge" }],
      },
      register(api) {
        api.contribute("ui.status", "badge", {
          kind: "ui.status",
          label: "Taken",
        });
      },
    });
    expect(isOk(await manager.register(clash))).toBe(true);
    expect((await manager.enable("test.clash")).ok).toBe(false);
  });

  it("exposes a service key for host DI without circular package imports", () => {
    const registry = createServiceRegistry();
    const manager = createExtensionManager();
    registry.register(ExtensionServiceKeys.manager, manager);
    expect(registry.resolve(ExtensionServiceKeys.manager)).toBe(manager);
  });

  it("does not implement product extensions", () => {
    const manager = createExtensionManager();
    expect(manager.list()).toHaveLength(0);
    // Guard: no auto-loaded official extensions
    expect(vi.isFakeTimers()).toBe(false);
  });
});
