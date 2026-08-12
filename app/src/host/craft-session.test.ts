import { describe, expect, it, vi } from "vitest";
import { createFakeAiProvider, createFakeContextAssembler } from "@jobjitsu/ai";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createCraftSessionStore } from "./craft-session.js";

describe("craft session store", () => {
  it("keeps prepare running and fills drafts after completion", async () => {
    const ai = createFakeAiProvider({ id: "fake-ai" });
    const assembler = createFakeContextAssembler();
    const bus = createInMemoryEventBus();
    const store = createCraftSessionStore({ ai, assembler, bus });

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

  it("does not clear résumé when only the job description is patched", () => {
    const store = createCraftSessionStore({
      ai: createFakeAiProvider(),
      assembler: createFakeContextAssembler(),
    });
    store.patch({ resumeText: "Sam Chen", jobDescription: "Role A" });
    store.patch({ jobDescription: "Role B" });
    expect(store.get().resumeText).toBe("Sam Chen");
    expect(store.get().jobDescription).toBe("Role B");
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
    const store = createCraftSessionStore({
      ai,
      assembler: createFakeContextAssembler(),
    });
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
