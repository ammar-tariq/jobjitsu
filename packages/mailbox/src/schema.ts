import {
  EMAIL_CLASSIFICATIONS,
  MAILBOX_ACTION_TYPES,
  type EmailClassification,
  type EmailClassificationResult,
  type MailboxActionType,
  type MailboxExtractedDates,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function parseDates(value: unknown): MailboxExtractedDates | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const dates: MailboxExtractedDates = {
    applicationDate: asString(value.applicationDate),
    assessmentDeadline: asString(value.assessmentDeadline),
    interviewDate: asString(value.interviewDate),
    responseDeadline: asString(value.responseDeadline),
    offerExpiration: asString(value.offerExpiration),
    followUpDate: asString(value.followUpDate),
  };
  return Object.values(dates).some(Boolean) ? dates : undefined;
}

/**
 * Strict schema validation — never trust malformed Agent output.
 */
export function parseClassificationJson(raw: unknown): EmailClassificationResult | undefined {
  const value = typeof raw === "string" ? tryParseJson(raw) : raw;
  if (!isRecord(value)) {
    return undefined;
  }
  const classification = asString(value.classification);
  if (!classification || !(EMAIL_CLASSIFICATIONS as readonly string[]).includes(classification)) {
    return undefined;
  }
  const isJobRelated = asBoolean(value.isJobRelated);
  if (isJobRelated === undefined) {
    return undefined;
  }
  const confidence = asNumber(value.confidence);
  if (confidence === undefined || confidence < 0 || confidence > 1) {
    return undefined;
  }
  const actionType = asString(value.actionType);
  if (actionType && !(MAILBOX_ACTION_TYPES as readonly string[]).includes(actionType)) {
    return undefined;
  }
  return {
    isJobRelated,
    classification: classification as EmailClassification,
    confidence,
    company: asString(value.company),
    jobTitle: asString(value.jobTitle),
    recruiterName: asString(value.recruiterName),
    recruiterEmail: asString(value.recruiterEmail),
    requiresUserAction: asBoolean(value.requiresUserAction) ?? false,
    actionType: actionType as MailboxActionType | undefined,
    importantDates: parseDates(value.importantDates),
    source: "ai",
  };
}

function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}
