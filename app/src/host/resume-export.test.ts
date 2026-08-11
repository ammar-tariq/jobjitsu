import { describe, expect, it } from "vitest";
import {
  buildResumeExportArtifacts,
  escapeHtml,
  flattenMarkdown,
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

  it("keeps PDF byte offsets valid for non-ASCII drafts (é, em dash)", () => {
    const bytes = renderResumePdfBytes("Résumé — Sam Chen\nCafé experience “quoted”");
    // Latin-1 decode mirrors how the bytes were written: 1 char per byte.
    let asText = "";
    for (const byte of bytes) {
      asText += String.fromCharCode(byte);
    }
    // é survives as Latin-1; typographic chars map to ASCII instead of mojibake.
    expect(asText).toContain("R\u00e9sum\u00e9 - Sam Chen");
    expect(asText).toContain('Caf\u00e9 experience "quoted"');
    expect(asText).not.toContain("\u00c3");
    // startxref must point at the actual xref table or viewers reject the file.
    const startxref = /startxref\n(\d+)\n%%EOF/.exec(asText);
    expect(startxref).not.toBeNull();
    const xrefPos = Number(startxref![1]);
    expect(asText.slice(xrefPos, xrefPos + 4)).toBe("xref");
  });

  it("flattens model markdown so exports have no literal ### / ** / ---", () => {
    const draft = [
      "**Ammar Tariq**",
      "Karachi, Pakistan | [linkedin.com/in/ammar10](https://linkedin.com/in/ammar10)",
      "---",
      "### **Summary**",
      "Senior engineer with *8+ years* of `React` experience.",
      "- Led development of **iCATM** for international markets.",
    ].join("\n");

    const flat = flattenMarkdown(draft);
    expect(flat).toContain("Ammar Tariq");
    expect(flat).toContain("Summary");
    expect(flat).toContain("linkedin.com/in/ammar10");
    expect(flat).toContain("Senior engineer with 8+ years of React experience.");
    expect(flat).toContain("- Led development of iCATM for international markets.");
    expect(flat).not.toMatch(/[#*`]|\[|\]\(/);

    const artifacts = buildResumeExportArtifacts(draft);
    expect(artifacts).not.toBeNull();
    expect(artifacts!.html).not.toContain("###");
    expect(artifacts!.html).not.toContain("**");
    const pdfText = new TextDecoder("latin1").decode(artifacts!.pdfBytes);
    expect(pdfText).toContain("(Summary) Tj");
  });

  it("returns null artifacts for empty draft", () => {
    expect(buildResumeExportArtifacts("   ")).toBeNull();
  });

  it("escapeHtml prevents markup injection", () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).not.toContain("<img");
  });
});
