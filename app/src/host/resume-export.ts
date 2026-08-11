/**
 * On-device résumé HTML + PDF export (PE28-S02).
 * No network; no SaaS HTML→PDF.
 */

export type ResumeExportArtifacts = {
  readonly html: string;
  readonly pdfBytes: Uint8Array;
  readonly fileNameBase: string;
};

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Calm print-friendly HTML from plain résumé draft text. */
export function renderResumeHtml(draftText: string): string {
  const body = draftText
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((line) => escapeHtml(line));
      return `<p>${lines.join("<br />")}</p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Résumé draft</title>
<style>
  @page { margin: 1.2cm; }
  body {
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #1a1a1a;
    max-width: 40rem;
    margin: 0 auto;
    padding: 1.5rem;
  }
  p { margin: 0 0 0.85rem; }
</style>
</head>
<body>
${body || "<p></p>"}
</body>
</html>
`;
}

function pdfEscape(text: string): string {
  return text.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

const LATIN1_SUBSTITUTES: Record<string, string> = {
  "\u2013": "-",
  "\u2014": "-",
  "\u2018": "'",
  "\u2019": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u2022": "-",
  "\u2026": "...",
  "\u00A0": " ",
};

/**
 * Helvetica in this minimal PDF renders Latin-1 bytes. Map common typographic
 * characters to ASCII and replace anything else outside Latin-1 so text stays
 * readable instead of turning into mojibake.
 */
function toLatin1(text: string): string {
  let out = "";
  for (const ch of text) {
    if (ch.length === 1 && ch.charCodeAt(0) <= 0xff) {
      out += ch;
    } else {
      out += LATIN1_SUBSTITUTES[ch] ?? "?";
    }
  }
  return out;
}

/**
 * PDF `/Length` and xref offsets are byte counts. After `toLatin1` every char
 * is <= 0xFF, so a 1:1 char→byte encoding keeps string lengths and byte
 * lengths identical (UTF-8 would drift for é and friends and corrupt the xref).
 */
function latin1Bytes(text: string): Uint8Array {
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

/**
 * Minimal multipage PDF (Helvetica) from plain text — local only, no deps.
 */
export function renderResumePdfBytes(draftText: string): Uint8Array {
  const maxChars = 90;
  const lineHeight = 14;
  const top = 770;
  const bottom = 60;
  const left = 50;

  const rawLines =
    draftText.trim().length === 0 ? [""] : toLatin1(draftText.replaceAll("\r\n", "\n")).split("\n");
  const contentLines = rawLines.flatMap((line) => wrapLine(line, maxChars));

  const linesPerPage = Math.floor((top - bottom) / lineHeight);
  const pages: string[][] = [];
  for (let i = 0; i < contentLines.length; i += linesPerPage) {
    pages.push(contentLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) {
    pages.push([""]);
  }

  const bodies = new Map<number, string>();
  const pageIds: number[] = [];
  const fontId = 3;
  bodies.set(fontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n");

  let nextId = 4;
  for (const pageLines of pages) {
    const contentId = nextId++;
    const pageId = nextId++;
    pageIds.push(pageId);

    const ops = ["BT", "/F1 11 Tf", `${left} ${top} Td`, `${lineHeight} TL`];
    pageLines.forEach((line, index) => {
      const escaped = pdfEscape(line);
      if (index === 0) {
        ops.push(`(${escaped}) Tj`);
      } else {
        ops.push("T*");
        ops.push(`(${escaped}) Tj`);
      }
    });
    ops.push("ET");
    const stream = ops.join("\n");
    bodies.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\n`);
    bodies.set(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>\n`,
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

  return latin1Bytes(pdf);
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function buildResumeExportArtifacts(draftText: string): ResumeExportArtifacts | null {
  const trimmed = draftText.trim();
  if (!trimmed) {
    return null;
  }
  return {
    html: renderResumeHtml(trimmed),
    pdfBytes: renderResumePdfBytes(trimmed),
    fileNameBase: "jobjitsu-resume-draft",
  };
}
