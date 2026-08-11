import { describe, expect, it } from "vitest";
import {
  buildResumeExportArtifacts,
  escapeHtml,
  flattenMarkdown,
  parseResumeBlocks,
  renderResumeHtml,
  renderResumePdfBytes,
} from "./resume-export.js";

const STRUCTURED_DRAFT = [
  "Ammar Tariq",
  "Karachi, Pakistan | ammar@example.dev",
  "",
  "PROFESSIONAL SUMMARY",
  "Senior engineer focused on React and Node.",
  "",
  "CORE SKILLS",
  "Languages: TypeScript, JavaScript, Python",
  "",
  "PROFESSIONAL EXPERIENCE",
  "Acme — Senior Engineer",
  "Karachi | 2020 – Present",
  "- Built production-grade React apps",
  "- Optimized PostgreSQL queries",
].join("\n");

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
    // Single-byte decode mirrors how the bytes were written: 1 char per byte.
    let asText = "";
    for (const byte of bytes) {
      asText += String.fromCharCode(byte);
    }
    // é survives as-is; typographic chars map to WinAnsi glyph bytes, not mojibake.
    expect(asText).toContain("R\u00e9sum\u00e9 \u0097 Sam Chen");
    expect(asText).toContain("Caf\u00e9 experience \u0093quoted\u0094");
    expect(asText).not.toContain("\u00c3");
    // startxref must point at the actual xref table or viewers reject the file.
    const startxref = /startxref\n(\d+)\n%%EOF/.exec(asText);
    expect(startxref).not.toBeNull();
    const xrefPos = Number(startxref![1]);
    expect(asText.slice(xrefPos, xrefPos + 4)).toBe("xref");
  });

  it("parses draft structure deterministically without altering text", () => {
    const kinds = parseResumeBlocks(STRUCTURED_DRAFT).map((block) => block.kind);
    expect(kinds).toEqual([
      "name",
      "contact",
      "gap",
      "heading",
      "paragraph",
      "gap",
      "heading",
      "label",
      "gap",
      "heading",
      "role",
      "meta",
      "bullet",
      "bullet",
    ]);
  });

  it("renders structured HTML with name, sections, roles, and bullets", () => {
    const html = renderResumeHtml(STRUCTURED_DRAFT);
    expect(html).toContain("<h1>Ammar Tariq</h1>");
    expect(html).toContain('<p class="contact">Karachi, Pakistan | ammar@example.dev</p>');
    expect(html).toContain("<h2>PROFESSIONAL SUMMARY</h2>");
    expect(html).toContain(
      '<p class="skill"><strong>Languages:</strong> TypeScript, JavaScript, Python</p>',
    );
    expect(html).toContain('<p class="role">Acme — Senior Engineer</p>');
    expect(html).toContain('<p class="meta">Karachi | 2020 – Present</p>');
    expect(html).toContain("<li>Built production-grade React apps</li>");
    expect(html).toContain("<li>Optimized PostgreSQL queries</li>");
  });

  it("styles the PDF with bold headings, section rules, and bullet glyphs", () => {
    const bytes = renderResumePdfBytes(STRUCTURED_DRAFT);
    let asText = "";
    for (const byte of bytes) {
      asText += String.fromCharCode(byte);
    }
    expect(asText).toContain("Helvetica-Bold");
    expect(asText).toContain("Helvetica-Oblique");
    // Name renders in bold 17pt; bullets use the WinAnsi bullet glyph.
    expect(asText).toContain("/F2 17 Tf");
    expect(asText).toContain("(\u0095) Tj");
    // Section headings draw a hairline rule.
    expect(asText).toMatch(/0\.72 G 0\.7 w \d+ -?\d+ m \d+ -?\d+ l S/);
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

  it("paginates long drafts across valid pages", () => {
    const longDraft = [
      "Sam Chen",
      "",
      "PROFESSIONAL EXPERIENCE",
      ...Array.from({ length: 120 }, (_, i) => `- Bullet ${i + 1} about steady on-device work`),
    ].join("\n");
    const bytes = renderResumePdfBytes(longDraft);
    let asText = "";
    for (const byte of bytes) {
      asText += String.fromCharCode(byte);
    }
    const count = /\/Count (\d+)/.exec(asText);
    expect(Number(count![1])).toBeGreaterThan(1);
    const startxref = /startxref\n(\d+)\n%%EOF/.exec(asText);
    expect(asText.slice(Number(startxref![1]), Number(startxref![1]) + 4)).toBe("xref");
  });

  it("returns null artifacts for empty draft", () => {
    expect(buildResumeExportArtifacts("   ")).toBeNull();
  });

  it("escapeHtml prevents markup injection", () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).not.toContain("<img");
  });
});
