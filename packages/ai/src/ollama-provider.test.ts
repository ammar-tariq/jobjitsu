import { describe, expect, it, vi } from "vitest";
import { createOllamaAiProvider } from "./ollama-provider.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createOllamaAiProvider (PE05-S06)", () => {
  it("rejects non-loopback base URLs", () => {
    expect(() =>
      createOllamaAiProvider({
        baseUrl: "https://api.example.com",
        getModelId: async () => "qwen2.5:3b",
      }),
    ).toThrow(/loopback/i);
  });

  it("reports misconfigured when model name is empty", async () => {
    const provider = createOllamaAiProvider({
      getModelId: async () => undefined,
      fetch: vi.fn(),
    });
    const health = await provider.health();
    expect(health.status).toBe("misconfigured");
    expect(health.locality).toBe("local");
  });

  it("reports ready when loopback Ollama lists the model", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toMatch(/^http:\/\/127\.0\.0\.1:11434\//);
      if (url.endsWith("/api/tags")) {
        return jsonResponse({ models: [{ name: "qwen2.5:3b" }] });
      }
      throw new Error(`unexpected ${url}`);
    });

    const provider = createOllamaAiProvider({
      getModelId: async () => "qwen2.5:3b",
      fetch: fetchMock as unknown as typeof fetch,
    });

    const health = await provider.health();
    expect(health.status).toBe("ready");
    expect(health.locality).toBe("local");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("completes via local /api/generate without remote hosts", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(url).toBe("http://127.0.0.1:11434/api/generate");
      expect(init?.method).toBe("POST");
      return jsonResponse({
        model: "qwen2.5:3b",
        response: "Tailored résumé draft for the role.",
      });
    });

    const provider = createOllamaAiProvider({
      getModelId: async () => "qwen2.5:3b",
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await provider.complete({
      role: "tailor",
      prompt: "role=tailor\nlisting=Acme",
    });
    expect(result.text).toContain("Tailored résumé draft");
    expect(result.modelId).toBe("qwen2.5:3b");
  });

  it("reports unavailable when Ollama is down", async () => {
    const provider = createOllamaAiProvider({
      getModelId: async () => "qwen2.5:3b",
      fetch: (async () => {
        throw new Error("connection refused");
      }) as typeof fetch,
    });
    const health = await provider.health();
    expect(health.status).toBe("unavailable");
    expect(health.message).toMatch(/Ollama is not reachable/i);
  });
});
