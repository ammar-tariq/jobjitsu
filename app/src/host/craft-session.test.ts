import { describe, expect, it, vi } from "vitest";
import { createFakeAiProvider } from "@jobjitsu/ai";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createCraftSessionStore } from "./craft-session.js";

describe("craft session store", () => {
  it("keeps prepare running and fills drafts after completion", async () => {
    const ai = createFakeAiProvider({ id: "fake-ai" });
    const bus = createInMemoryEventBus();
    const store = createCraftSessionStore({ ai, bus });

    store.patch({
      resumeText: "Sam Chen — staff engineer",
      jobDescription: "Staff Engineer at Acme",
    });

    const snapshots: string[] = [];
    store.subscribe((session) => {
      snapshots.push(`${session.job.status}:${session.job.phase ?? "-"}`);
    });

    const started = store.prepareDrafts("both");
    expect(started.job.status).toBe("running");
    expect(started.job.message).toMatch(/Checking Agent/i);

    await vi.waitFor(() => {
      expect(store.get().job.status).toBe("ready");
    });

    const done = store.get();
    expect(done.resumeDraft.length).toBeGreaterThan(0);
    expect(done.coverLetterDraft.length).toBeGreaterThan(0);
    expect(done.job.message).toMatch(/Drafts ready/i);
    expect(snapshots.some((entry) => entry.startsWith("running:"))).toBe(true);
  });

  it("keeps stored fields when a patch arrives with undefined keys (IPC shape)", () => {
    const store = createCraftSessionStore({
      ai: createFakeAiProvider(),
    });

    store.patch({ resumeText: "Sam Chen — résumé body" });
    // IPC handlers send every key, undefined for untouched fields.
    const next = store.patch({
      resumeText: undefined,
      jobDescription: "Staff Engineer at Acme",
      aboutCompany: undefined,
      resumeDraft: undefined,
      coverLetterDraft: undefined,
      saveCompany: undefined,
      saveRole: undefined,
      chatTarget: undefined,
      chatInput: undefined,
      chatMessages: undefined,
    });

    expect(next.resumeText).toBe("Sam Chen — résumé body");
    expect(next.jobDescription).toBe("Staff Engineer at Acme");
  });

  it("passes tone preferences into prepare", async () => {
    const complete = vi.fn(async () => ({ text: "Draft", modelId: "fake" }));
    const store = createCraftSessionStore({
      ai: { ...createFakeAiProvider(), complete },
      getTonePreferences: async () => "calm coach voice",
    });
    store.patch({
      resumeText: "Sam Chen",
      jobDescription: "Engineer",
    });
    store.prepareDrafts("resume");
    await vi.waitFor(() => {
      expect(store.get().job.status).toBe("ready");
    });
    expect(complete.mock.calls[0]?.[0]?.prompt).toContain("calm coach voice");
  });

  it("does not start a second prepare while one is running", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const ai = {
      ...createFakeAiProvider({ id: "slow-ai" }),
      async complete() {
        await gate;
        return { text: "Slow draft", modelId: "fake-model" };
      },
    };
    const store = createCraftSessionStore({ ai });
    store.patch({
      resumeText: "Résumé",
      jobDescription: "Role",
    });

    const first = store.prepareDrafts("resume");
    expect(first.job.status).toBe("running");
    const second = store.prepareDrafts("cover_letter");
    expect(second.job.kind).toBe("resume");
    release();
    await vi.waitFor(() => {
      expect(store.get().job.status).toBe("ready");
    });
  });
});
