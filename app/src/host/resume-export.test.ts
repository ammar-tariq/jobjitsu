import { describe, expect, it } from "vitest";
import {
  buildResumeExportArtifacts,
  escapeHtml,
  renderResumeHtml,
  renderResumePdfBytes,
} from "./resume-export.js";

describe("resume export (PE28-S02)", () => {
  it("escapes HTML and builds a calm document", () => {
    const html = renderResumeHtml("Sam <Chen>\n\nBuilt APIs & tools");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Sam &lt;Chen&gt;");
    expect(html).toContain("Built APIs &amp; tools");
    expect(html).not.toContain("<script");
  });

  it("produces a PDF header from draft text without network", () => {
    const bytes = renderResumePdfBytes("Sam Chen\nStaff engineer\n\nBuilt on-device tools.");
    const asText = new TextDecoder().decode(bytes);
    expect(asText.startsWith("%PDF-1.4")).toBe(true);
    expect(asText).toContain("%%EOF");
    expect(asText).toContain("Helvetica");
  });

  it("returns null artifacts for empty draft", () => {
    expect(buildResumeExportArtifacts("   ")).toBeNull();
  });

  it("escapeHtml prevents markup injection", () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).not.toContain("<img");
  });
});
