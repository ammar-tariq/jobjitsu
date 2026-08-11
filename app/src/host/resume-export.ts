/**
 * On-device résumé HTML + PDF export (PE28-S02).
 * No network; no SaaS HTML→PDF.
 *
 * Drafts are plain text (the tailor prompt forbids markdown). To keep exports
 * from looking like a text dump, `parseResumeBlocks` reads the structure that
 * plain text already carries — name/contact preamble, ALL-CAPS section
 * headings, "Company — Title" lines, "Location | Dates" lines, "Label: …"
 * skill lines, and "- " bullets — and both renderers style those blocks.
 */

export type ResumeExportArtifacts = {
  readonly html: string;
  readonly pdfBytes: Uint8Array;
  readonly fileNameBase: string;
};

/**
 * Local models often answer in markdown. Flatten the common notation
 * (headings, bold/italic, rules, links) into clean résumé text so exports
 * don't show literal `###` / `**` / `---`. The editable draft keeps whatever
 * the user typed — this runs only when building export artifacts.
 */
export function flattenMarkdown(text: string): string {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const out: string[] = [];
  for (const rawLine of lines) {
    // Horizontal rules become paragraph breaks.
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(rawLine)) {
      out.push("");
      continue;
    }
    let line = rawLine;
    line = line.replace(/^\s{0,3}#{1,6}\s+/, "");
    line = line.replace(/^\s*>\s?/, "");
    line = line.replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1");
    line = line.replace(/\*\*([^*]+)\*\*/g, "$1");
    line = line.replace(/\*([^*]+)\*/g, "$1");
    line = line.replaceAll("`", "");
    out.push(line);
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type ResumeBlock =
  | { readonly kind: "name"; readonly text: string }
  | { readonly kind: "contact"; readonly text: string }
  | { readonly kind: "heading"; readonly text: string }
  | { readonly kind: "role"; readonly text: string }
  | { readonly kind: "meta"; readonly text: string }
  | { readonly kind: "label"; readonly label: string; readonly text: string }
  | { readonly kind: "bullet"; readonly text: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | { readonly kind: "gap" };

const KNOWN_HEADINGS = new Set([
  "professional summary",
  "summary",
  "profile",
  "objective",
  "core skills",
  "skills",
  "technical skills",
  "professional experience",
  "experience",
  "work experience",
  "work history",
  "employment history",
  "clinical experience",
  "teaching experience",
  "research experience",
  "volunteer experience",
  "projects",
  "selected projects",
  "personal projects",
  "project spotlight",
  "education",
  "certifications",
  "certification",
  "licenses",
  "awards",
  "publications",
  "professional development",
]);

const BULLET_RE = /^\s*[-*\u2022\u2013\u2014]\s+/;
const LABEL_RE = /^([A-Za-z][A-Za-z0-9 &/+.'()-]{0,39}):\s+(\S.*)$/;

/** Sections whose blocks open with an entry line (company, school, project). */
const ENTRY_SECTION_RE =
  /EXPERIENCE|EMPLOYMENT|WORK HISTORY|PROJECT|SPOTLIGHT|EDUCATION|CERTIFICATION/;

function isResumeHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 60 || /[:|@]/.test(trimmed)) {
    return false;
  }
  if (trimmed.replace(/[^A-Za-z]/g, "").length < 3) {
    return false;
  }
  if (KNOWN_HEADINGS.has(trimmed.toLowerCase())) {
    return true;
  }
  return (
    trimmed === trimmed.toUpperCase() && trimmed.split(/\s+/).length <= 6 && !/[.!?]$/.test(trimmed)
  );
}

function looksLikeMeta(line: string): boolean {
  if (line.length > 80) {
    return false;
  }
  return line.includes("|") || /\b(19|20)\d{2}\b/.test(line) || /\bpresent\b/i.test(line);
}

/**
 * Deterministic structure pass over the flattened draft. Heuristics only
 * reorder presentation — the text itself is never altered or invented.
 */
export function parseResumeBlocks(text: string): readonly ResumeBlock[] {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const blocks: ResumeBlock[] = [];
  let i = 0;
  while (i < lines.length && lines[i]!.trim() === "") {
    i += 1;
  }

  // Preamble: treat the first short line as the candidate's name unless the
  // draft opens straight at a known section (all-caps names stay names).
  const first = lines[i]?.trim() ?? "";
  if (
    first !== "" &&
    !KNOWN_HEADINGS.has(first.toLowerCase()) &&
    !BULLET_RE.test(first) &&
    !first.includes(":") &&
    first.length <= 60 &&
    first.split(/\s+/).length <= 6
  ) {
    blocks.push({ kind: "name", text: first });
    i += 1;
    while (i < lines.length && lines[i]!.trim() !== "" && !isResumeHeading(lines[i]!.trim())) {
      blocks.push({ kind: "contact", text: lines[i]!.trim() });
      i += 1;
    }
  }

  let section = "";
  let atBlockStart = true;
  let prevKind: ResumeBlock["kind"] | null = null;

  for (; i < lines.length; i += 1) {
    const trimmed = lines[i]!.trim();
    if (trimmed === "") {
      if (blocks.length > 0 && blocks[blocks.length - 1]!.kind !== "gap") {
        blocks.push({ kind: "gap" });
      }
      atBlockStart = true;
      prevKind = "gap";
      continue;
    }

    if (isResumeHeading(trimmed)) {
      blocks.push({ kind: "heading", text: trimmed });
      section = trimmed.toUpperCase();
      atBlockStart = true;
      prevKind = "heading";
      continue;
    }

    if (BULLET_RE.test(trimmed)) {
      blocks.push({ kind: "bullet", text: trimmed.replace(BULLET_RE, "") });
      prevKind = "bullet";
      atBlockStart = false;
      continue;
    }

    const label = LABEL_RE.exec(trimmed);
    if (label && label[1]!.split(/\s+/).length <= 4) {
      blocks.push({ kind: "label", label: label[1]!, text: label[2]! });
      prevKind = "label";
      atBlockStart = false;
      continue;
    }

    const inEntrySection = ENTRY_SECTION_RE.test(section);
    if (inEntrySection && atBlockStart) {
      blocks.push({ kind: "role", text: trimmed });
      prevKind = "role";
      atBlockStart = false;
      continue;
    }
    if (inEntrySection && prevKind === "role" && looksLikeMeta(trimmed)) {
      blocks.push({ kind: "meta", text: trimmed });
      prevKind = "meta";
      atBlockStart = false;
      continue;
    }

    blocks.push({ kind: "paragraph", text: trimmed });
    prevKind = "paragraph";
    atBlockStart = false;
  }

  while (blocks.length > 0 && blocks[blocks.length - 1]!.kind === "gap") {
    blocks.pop();
  }
  return blocks;
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Calm print-friendly HTML with real hierarchy from the plain résumé draft. */
export function renderResumeHtml(draftText: string): string {
  const blocks = parseResumeBlocks(draftText.trim());
  const out: string[] = [];
  let listOpen = false;
  const closeList = (): void => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  for (const block of blocks) {
    if (block.kind === "bullet") {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${escapeHtml(block.text)}</li>`);
      continue;
    }
    closeList();
    switch (block.kind) {
      case "name":
        out.push(`<h1>${escapeHtml(block.text)}</h1>`);
        break;
      case "contact":
        out.push(`<p class="contact">${escapeHtml(block.text)}</p>`);
        break;
      case "heading":
        out.push(`<h2>${escapeHtml(block.text)}</h2>`);
        break;
      case "role":
        out.push(`<p class="role">${escapeHtml(block.text)}</p>`);
        break;
      case "meta":
        out.push(`<p class="meta">${escapeHtml(block.text)}</p>`);
        break;
      case "label":
        out.push(
          `<p class="skill"><strong>${escapeHtml(block.label)}:</strong> ${escapeHtml(block.text)}</p>`,
        );
        break;
      case "paragraph":
        out.push(`<p>${escapeHtml(block.text)}</p>`);
        break;
      case "gap":
        break;
    }
  }
  closeList();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Résumé draft</title>
<style>
  @page { margin: 1.1cm; }
  body {
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    font-size: 10.5pt;
    line-height: 1.42;
    color: #1b1b1b;
    background: #ffffff;
    max-width: 44rem;
    margin: 0 auto;
    padding: 1.6rem 1.8rem;
  }
  h1 {
    font-size: 19pt;
    font-weight: 700;
    letter-spacing: 0.01em;
    margin: 0 0 0.1rem;
  }
  .contact { margin: 0; font-size: 9pt; color: #4a4a4a; }
  h2 {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    border-bottom: 1px solid #b9b9b9;
    padding-bottom: 0.15rem;
    margin: 1.15rem 0 0.4rem;
  }
  .role { font-weight: 700; margin: 0.55rem 0 0; }
  .meta { font-style: italic; color: #555555; font-size: 9pt; margin: 0.05rem 0 0.15rem; }
  .skill { margin: 0.12rem 0; }
  ul { margin: 0.2rem 0 0.45rem 1.15rem; padding: 0; }
  li { margin: 0 0 0.16rem; }
  p { margin: 0.3rem 0; }
</style>
</head>
<body>
${out.join("\n") || "<p></p>"}
</body>
</html>
`;
}

function pdfEscape(text: string): string {
  return text.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

/**
 * Fonts declare /Encoding /WinAnsiEncoding, so typographic characters map to
 * their windows-1252 bytes (0x80–0x9F) and render as real glyphs — en/em
 * dashes, curly quotes, bullets, ellipsis — instead of ASCII stand-ins.
 */
const WINANSI_SUBSTITUTES: Record<string, string> = {
  "\u2013": "\u0096",
  "\u2014": "\u0097",
  "\u2018": "\u0091",
  "\u2019": "\u0092",
  "\u201C": "\u0093",
  "\u201D": "\u0094",
  "\u2022": "\u0095",
  "\u2026": "\u0085",
  "\u00A0": " ",
};

/**
 * Map text to single-byte WinAnsi form. Anything without a mapping outside
 * Latin-1 becomes "?" so text stays readable instead of turning into mojibake.
 */
function toWinAnsi(text: string): string {
  let out = "";
  for (const ch of text) {
    if (ch.length === 1 && ch.charCodeAt(0) <= 0xff) {
      out += ch;
    } else {
      out += WINANSI_SUBSTITUTES[ch] ?? "?";
    }
  }
  return out;
}

/**
 * PDF `/Length` and xref offsets are byte counts. After `toWinAnsi` every char
 * is <= 0xFF, so a 1:1 char→byte encoding keeps string lengths and byte
 * lengths identical (UTF-8 would drift for é and friends and corrupt the xref).
 */
function singleByteBytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function wrapLine(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) {
    return [text];
  }
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current.length === 0 ? word : `${current} ${word}`;
    if (next.length > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

type PdfTextStyle = {
  readonly font: 1 | 2 | 3;
  readonly size: number;
  readonly lineHeight: number;
  readonly gray?: number;
  /** Average glyph width in em for wrap estimation. */
  readonly em: number;
};

const PDF_STYLES = {
  name: { font: 2, size: 17, lineHeight: 22, em: 0.55 },
  contact: { font: 1, size: 9, lineHeight: 12, gray: 0.3, em: 0.5 },
  heading: { font: 2, size: 10.5, lineHeight: 14, em: 0.55 },
  role: { font: 2, size: 10.5, lineHeight: 14, em: 0.55 },
  meta: { font: 3, size: 9, lineHeight: 12, gray: 0.35, em: 0.5 },
  body: { font: 1, size: 10.5, lineHeight: 13.5, em: 0.52 },
} as const satisfies Record<string, PdfTextStyle>;

const PDF_BULLET = "\u0095";

/**
 * Styled multipage PDF (Helvetica family) from plain draft text — local only,
 * no deps. Structure comes from `parseResumeBlocks`; layout is a single
 * top-to-bottom cursor with page breaks.
 */
export function renderResumePdfBytes(draftText: string): Uint8Array {
  const left = 54;
  const right = 558;
  const top = 762;
  const bottom = 56;

  const pages: string[][] = [];
  let ops: string[] = [];
  let y = top;

  const breakPage = (): void => {
    pages.push(ops);
    ops = [];
    y = top;
  };
  const ensureRoom = (needed: number): void => {
    if (y - needed < bottom && ops.length > 0) {
      breakPage();
    }
  };
  const maxCharsFor = (style: PdfTextStyle, widthPts: number): number =>
    Math.max(16, Math.floor(widthPts / (style.size * style.em)));

  /** `text` must already be WinAnsi-mapped. */
  const putLine = (text: string, style: PdfTextStyle, x: number): void => {
    ensureRoom(style.lineHeight);
    y -= style.lineHeight;
    const yy = Math.round(y);
    if (style.gray !== undefined) {
      ops.push(`${style.gray} g`);
    }
    ops.push(`BT /F${style.font} ${style.size} Tf ${x} ${yy} Td (${pdfEscape(text)}) Tj ET`);
    if (style.gray !== undefined) {
      ops.push("0 g");
    }
  };

  const putWrapped = (text: string, style: PdfTextStyle): void => {
    const mapped = toWinAnsi(text);
    for (const line of wrapLine(mapped, maxCharsFor(style, right - left))) {
      putLine(line, style, left);
    }
  };

  const putHeading = (text: string): void => {
    const style = PDF_STYLES.heading;
    // Keep the heading, its rule, and at least one body line together.
    ensureRoom(10 + style.lineHeight + 6 + PDF_STYLES.body.lineHeight);
    if (ops.length > 0) {
      y -= 10;
    }
    y -= style.lineHeight;
    const yy = Math.round(y);
    ops.push(
      `BT /F${style.font} ${style.size} Tf ${left} ${yy} Td (${pdfEscape(toWinAnsi(text))}) Tj ET`,
    );
    const ruleY = yy - 3;
    ops.push(`0.72 G 0.7 w ${left} ${ruleY} m ${right} ${ruleY} l S`);
    y = ruleY - 2;
  };

  const putBullet = (text: string): void => {
    const style = PDF_STYLES.body;
    const textX = left + 14;
    const lines = wrapLine(toWinAnsi(text), maxCharsFor(style, right - textX));
    lines.forEach((line, index) => {
      ensureRoom(style.lineHeight);
      y -= style.lineHeight;
      const yy = Math.round(y);
      if (index === 0) {
        ops.push(`BT /F1 ${style.size} Tf ${left + 2} ${yy} Td (${PDF_BULLET}) Tj ET`);
      }
      ops.push(`BT /F1 ${style.size} Tf ${textX} ${yy} Td (${pdfEscape(line)}) Tj ET`);
    });
  };

  const putLabel = (label: string, text: string): void => {
    const style = PDF_STYLES.body;
    const labelText = `${toWinAnsi(label)}:`;
    const restX = Math.min(left + Math.ceil(labelText.length * style.size * 0.6) + 5, left + 190);
    const lines = wrapLine(toWinAnsi(text), maxCharsFor(style, right - restX));
    lines.forEach((line, index) => {
      ensureRoom(style.lineHeight);
      y -= style.lineHeight;
      const yy = Math.round(y);
      if (index === 0) {
        ops.push(`BT /F2 ${style.size} Tf ${left} ${yy} Td (${pdfEscape(labelText)}) Tj ET`);
      }
      ops.push(`BT /F1 ${style.size} Tf ${restX} ${yy} Td (${pdfEscape(line)}) Tj ET`);
    });
  };

  const blocks = parseResumeBlocks(draftText.trim());
  for (const block of blocks) {
    switch (block.kind) {
      case "name":
        putWrapped(block.text, PDF_STYLES.name);
        y -= 2;
        break;
      case "contact":
        putWrapped(block.text, PDF_STYLES.contact);
        break;
      case "heading":
        putHeading(block.text);
        break;
      case "role":
        if (y !== top) {
          y -= 3;
        }
        putWrapped(block.text, PDF_STYLES.role);
        break;
      case "meta":
        putWrapped(block.text, PDF_STYLES.meta);
        break;
      case "bullet":
        putBullet(block.text);
        break;
      case "label":
        putLabel(block.label, block.text);
        break;
      case "paragraph":
        putWrapped(block.text, PDF_STYLES.body);
        break;
      case "gap":
        if (y !== top && y - 5 > bottom) {
          y -= 5;
        }
        break;
    }
  }
  pages.push(ops);

  const bodies = new Map<number, string>();
  bodies.set(
    3,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\n",
  );
  bodies.set(
    4,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\n",
  );
  bodies.set(
    5,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\n",
  );

  const pageIds: number[] = [];
  let nextId = 6;
  for (const pageOps of pages) {
    const contentId = nextId++;
    const pageId = nextId++;
    pageIds.push(pageId);
    const stream = pageOps.join("\n");
    bodies.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\n`);
    bodies.set(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> >>\n`,
    );
  }

  bodies.set(1, "<< /Type /Catalog /Pages 2 0 R >>\n");
  bodies.set(
    2,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>\n`,
  );

  const maxId = nextId - 1;
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let id = 1; id <= maxId; id += 1) {
    offsets[id] = pdf.length;
    const body = bodies.get(id);
    if (!body) {
      throw new Error(`Missing PDF object ${id}`);
    }
    pdf += `${id} 0 obj\n${body}endobj\n`;
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${maxId + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= maxId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return singleByteBytes(pdf);
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function buildResumeExportArtifacts(draftText: string): ResumeExportArtifacts | null {
  const cleaned = flattenMarkdown(draftText);
  if (!cleaned) {
    return null;
  }
  return {
    html: renderResumeHtml(cleaned),
    pdfBytes: renderResumePdfBytes(cleaned),
    fileNameBase: "jobjitsu-resume-draft",
  };
}
