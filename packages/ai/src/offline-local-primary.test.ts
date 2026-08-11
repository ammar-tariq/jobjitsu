import { afterEach, describe, expect, it } from "vitest";
import type { AiProvider } from "./provider.js";
import { createAiProviderRegistry, createFakeAiProvider } from "./index.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function disableNetwork(): { readonly fetchCalls: () => number } {
  let fetchCalls = 0;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("network disabled for offline local-primary test");
  }) as typeof fetch;
  return {
    fetchCalls: () => fetchCalls,
  };
}

function spyComplete(provider: AiProvider): {
  readonly provider: AiProvider;
  readonly completeCalls: () => number;
} {
  let completeCalls = 0;
  return {
    completeCalls: () => completeCalls,
    provider: {
      id: provider.id,
      locality: provider.locality,
      health: () => provider.health(),
      embed: provider.embed?.bind(provider),
      async complete(request) {
        completeCalls += 1;
        return provider.complete(request);
      },
    },
  };
}

describe("@jobjitsu/ai offline / local-primary (PE05-S05)", () => {
  it("runs local health and complete with network disabled", async () => {
    const net = disableNetwork();
    const provider = createFakeAiProvider({ id: "local-offline", locality: "local" });

    const health = await provider.health();
    expect(health.status).toBe("ready");
    expect(health.locality).toBe("local");

    const result = await provider.complete({
      role: "tailor",
      prompt: "offline craft draft",
    });
    expect(result.text).toContain("Tailored résumé draft");
    expect(net.fetchCalls()).toBe(0);
  });

  it("does not silently fall back to a remote provider when local fails", async () => {
    const net = disableNetwork();
    const local = createFakeAiProvider({
      id: "local-ai",
      locality: "local",
      healthStatus: "unavailable",
    });
    const remoteSpy = spyComplete(
      createFakeAiProvider({ id: "remote-ai", locality: "remote", healthStatus: "ready" }),
    );
    const registry = createAiProviderRegistry([local]);
    registry.register(remoteSpy.provider);

    const active = registry.getActive();
    expect(active?.id).toBe("local-ai");
    expect(active?.locality).toBe("local");

    const health = await active!.health();
    expect(health.status).toBe("unavailable");
    expect(health.locality).toBe("local");

    await expect(
      active!.complete({ role: "generic", prompt: "must not reach remote" }),
    ).rejects.toThrow(/Preferences|model path/i);

    expect(remoteSpy.completeCalls()).toBe(0);
    expect(registry.getActive()?.id).toBe("local-ai");
    expect(net.fetchCalls()).toBe(0);
  });
});
