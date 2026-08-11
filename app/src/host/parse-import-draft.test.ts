import { describe, expect, it } from "vitest";
import { createFakeAiProvider, createFakeContextAssembler } from "@jobjitsu/ai";
import { extractImportTextExcerpt, parseImportDraftWithAi } from "./parse-import-draft.js";

function toBase64(text: string): string {
  return btoa(text);
}

describe("parseImportDraftWithAi (PE03-S10)", () => {
  it("prefills allowlisted fields from local Agent without network", async () => {
    const fields = await parseImportDraftWithAi({
      ai: createFakeAiProvider({ id: "fake-ai" }),
      assembler: createFakeContextAssembler(),
      input: {
        contentBase64: toBase64("# Sam Chen\nsam@example.com\nStaff engineer\n"),
        fileName: "sam.md",
        contentType: "text/markdown",
      },
    });
    expect(fields.parseStatus).toBe("prefilled");
    expect(fields.contactName).toBe("Sam Chen");
    expect(fields.contactEmail).toBe("sam@example.com");
  });

  it("falls back calmly when Agent is unavailable", async () => {
    const fields = await parseImportDraftWithAi({
      ai: createFakeAiProvider({ healthStatus: "unavailable" }),
      assembler: createFakeContextAssembler(),
      input: {
        contentBase64: toBase64("# Sam Chen\n"),
        fileName: "sam.md",
      },
    });
    expect(fields.parseStatus).toBe("unavailable");
    expect(fields.contactName).toBe("");
    expect(fields.contactEmail).toBe("");
  });

  it("does not invent fields for opaque PDF bytes", async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0x01, 0xff, 0xfe]);
    expect(
      extractImportTextExcerpt(bytes, { fileName: "profile.pdf", contentType: "application/pdf" }),
    ).toBe("");
    const fields = await parseImportDraftWithAi({
      ai: createFakeAiProvider(),
      assembler: createFakeContextAssembler(),
      input: {
        contentBase64: btoa(String.fromCharCode(...bytes)),
        fileName: "profile.pdf",
        contentType: "application/pdf",
      },
    });
    expect(fields.parseStatus).toBe("manual");
    expect(fields.contactName).toBe("");
  });
});
