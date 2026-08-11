import type { AiProvider, ContextAssembler } from "@jobjitsu/ai";

export type ParseImportDraftRequest = {
  readonly contentBase64: string;
  readonly fileName?: string;
  readonly contentType?: string;
};

export type ParseImportDraftFields = {
  readonly contactName: string;
  readonly contactEmail: string;
  readonly notes: string;
  /**
   * `prefilled` — Agent suggested fields (still editable).
   * `unavailable` — Agent not ready; edit by hand.
   * `manual` — no usable suggestions; edit by hand (no guilt).
   */
  readonly parseStatus: "prefilled" | "unavailable" | "manual";
};

const EMPTY: ParseImportDraftFields = {
  contactName: "",
  contactEmail: "",
  notes: "",
  parseStatus: "manual",
};

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function looksLikePdf(fileName?: string, contentType?: string): boolean {
  const lower = fileName?.toLowerCase() ?? "";
  return lower.endsWith(".pdf") || (contentType?.includes("pdf") ?? false);
}

/** Cheap on-device text excerpt — no OCR; PDF/binary → empty. */
export function extractImportTextExcerpt(
  bytes: Uint8Array,
  options: { readonly fileName?: string; readonly contentType?: string } = {},
): string {
  if (looksLikePdf(options.fileName, options.contentType)) {
    return "";
  }
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const sample = text.slice(0, 4000);
  let printable = 0;
  for (let i = 0; i < sample.length; i += 1) {
    const code = sample.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code < 127)) {
      printable += 1;
    }
  }
  if (sample.length > 0 && printable / sample.length < 0.85) {
    return "";
  }
  return sample.trim();
}

function mapParsedJson(text: string): {
  readonly contactName: string;
  readonly contactEmail: string;
  readonly notes: string;
} {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) {
      return { contactName: "", contactEmail: "", notes: "" };
    }
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    return {
      contactName: typeof parsed.contactName === "string" ? parsed.contactName.trim() : "",
      contactEmail: typeof parsed.contactEmail === "string" ? parsed.contactEmail.trim() : "",
      notes: typeof parsed.notes === "string" ? parsed.notes.trim() : "",
    };
  } catch {
    return { contactName: "", contactEmail: "", notes: "" };
  }
}

/**
 * Host-only import parse — UI never imports `@jobjitsu/ai`.
 * Prefills review fields only; never imports, attaches, or sends.
 */
export async function parseImportDraftWithAi(options: {
  readonly ai: AiProvider;
  readonly assembler: ContextAssembler;
  readonly input: ParseImportDraftRequest;
}): Promise<ParseImportDraftFields> {
  const health = await options.ai.health();
  if (health.status !== "ready") {
    return { ...EMPTY, parseStatus: "unavailable" };
  }

  const bytes = decodeBase64(options.input.contentBase64);
  const excerpt = extractImportTextExcerpt(bytes, {
    fileName: options.input.fileName,
    contentType: options.input.contentType,
  });
  if (!excerpt) {
    return { ...EMPTY, parseStatus: "manual" };
  }

  const prompt = options.assembler.assemble({
    role: "parse_assist",
    resumeExcerpts: [excerpt],
  });

  try {
    const completion = await options.ai.complete({
      role: "parse_assist",
      prompt,
      responseFormat: "json",
    });
    const fields = mapParsedJson(completion.text);
    const hasAny = Boolean(fields.contactName || fields.contactEmail || fields.notes);
    return {
      ...fields,
      parseStatus: hasAny ? "prefilled" : "manual",
    };
  } catch {
    return { ...EMPTY, parseStatus: "manual" };
  }
}
