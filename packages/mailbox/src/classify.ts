import { companyFromDomain, emailDomain, isAtsOrBoardDomain } from "./domains.js";
import type {
  EmailClassificationResult,
  MailboxActionType,
  MailboxExtractedDates,
} from "./types.js";

const CLASSIFICATION_RULES: readonly {
  readonly classification: EmailClassificationResult["classification"];
  readonly patterns: readonly RegExp[];
  readonly confidence: number;
  readonly requiresUserAction?: boolean;
  readonly actionType?: MailboxActionType;
}[] = [
  {
    classification: "offer",
    patterns: [
      /\boffer letter\b/i,
      /\bcompensation package\b/i,
      /\bwe are (pleased|excited) to offer\b/i,
    ],
    confidence: 0.92,
    requiresUserAction: true,
    actionType: "review_offer",
  },
  {
    classification: "rejection",
    patterns: [
      /\bwe regret\b/i,
      /\bunfortunately.{0,40}not (moving|selected|able)/i,
      /\bwill not be moving forward\b/i,
      /\bother candidates\b/i,
    ],
    confidence: 0.9,
  },
  {
    classification: "assessment",
    patterns: [
      /\bhackerrank\b/i,
      /\bcodility\b/i,
      /\bcodesignal\b/i,
      /\btechnical assessment\b/i,
      /\bcoding (test|challenge|assessment)\b/i,
      /\btake[- ]home\b/i,
    ],
    confidence: 0.91,
    requiresUserAction: true,
    actionType: "complete_assessment",
  },
  {
    classification: "assessment_confirmation",
    patterns: [/\bassessment (submitted|completed|received)\b/i, /\bthanks for completing\b/i],
    confidence: 0.88,
  },
  {
    classification: "interview_confirmation",
    patterns: [/\binterview (is )?confirmed\b/i, /\bcalendar (invite|invitation)\b/i],
    confidence: 0.88,
  },
  {
    classification: "interview_reschedule",
    patterns: [/\breschedul/i, /\bnew time for (your )?interview\b/i],
    confidence: 0.86,
    requiresUserAction: true,
    actionType: "schedule_interview",
  },
  {
    classification: "interview_invitation",
    patterns: [
      /\binterview\b/i,
      /\bschedule (a |your )?time\b/i,
      /\bcalendly\b/i,
      /\bgoodtime\b/i,
      /\bselect a time\b/i,
    ],
    confidence: 0.86,
    requiresUserAction: true,
    actionType: "schedule_interview",
  },
  {
    classification: "application_confirmation",
    patterns: [
      /\bapplication (was )?received\b/i,
      /\bthank you for applying\b/i,
      /\bwe (have )?received your application\b/i,
    ],
    confidence: 0.9,
  },
  {
    classification: "withdrawal",
    patterns: [/\bwithdraw(n|al)\b/i, /\bno longer wish to be considered\b/i],
    confidence: 0.84,
  },
  {
    classification: "request_for_information",
    patterns: [
      /\bplease (send|provide|share)\b/i,
      /\bupdated resume\b/i,
      /\bavailability\b/i,
      /\bright to work\b/i,
    ],
    confidence: 0.8,
    requiresUserAction: true,
    actionType: "reply_to_recruiter",
  },
  {
    classification: "job_application",
    patterns: [/\bapplication for\b/i, /\bapplied to\b/i, /\bsubmitted (my |your )?application\b/i],
    confidence: 0.84,
  },
  {
    classification: "recruiter_message",
    patterns: [
      /\brecruiter\b/i,
      /\btalent (acquisition|partner)\b/i,
      /\bregarding your (profile|application)\b/i,
    ],
    confidence: 0.78,
  },
  {
    classification: "follow_up",
    patterns: [/\bfollow[- ]up\b/i, /\bchecking in\b/i],
    confidence: 0.76,
  },
];

const TITLE_PATTERNS = [
  /(?:application for|applied for|role of|position of|role:|position:)\s+([^.\n]{4,80})/i,
  /(?:senior|staff|principal|junior|lead)?\s*(?:react native|full[- ]stack|frontend|front-end|backend|back-end|ios|android|mobile|ai|ml|data|product|software|platform)?\s*(?:engineer|developer|designer|manager|scientist)/i,
];

const COMPANY_PATTERNS = [
  /your application (?:at|to)\s+([A-Z][A-Za-z0-9&.-]+)/i,
  /(?:role|position|engineer|developer) at\s+([A-Z][A-Za-z0-9&.-]+)/i,
  /(?:at|with)\s+([A-Z][A-Za-z0-9&.-]+)/,
];

export function extractUrls(text: string): readonly string[] {
  const matches = text.match(/https?:\/\/[^\s<>"']+/gi) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[),.;]+$/, "")))];
}

export function extractDates(text: string): MailboxExtractedDates {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  const deadline = text.match(
    /\b(?:due|deadline|by|before)\s+(.{0,24}?)(\d{1,2}\s+\w+|\w+\s+\d{1,2}|\d{4}-\d{2}-\d{2})/i,
  );
  return {
    interviewDate: /\binterview\b/i.test(text) && iso ? iso[1] : undefined,
    assessmentDeadline:
      deadline && /\b(assessment|hackerrank|codility)\b/i.test(text) ? iso?.[1] : undefined,
    offerExpiration: /\boffer\b/i.test(text) && /\bexpir/i.test(text) && iso ? iso[1] : undefined,
  };
}

export function extractJobTitle(subject: string, body: string): string | undefined {
  const haystack = `${subject}\n${body}`;
  for (const pattern of TITLE_PATTERNS) {
    const match = haystack.match(pattern);
    const raw = match?.[1]?.trim() ?? match?.[0]?.trim();
    if (raw && raw.length >= 4 && raw.length <= 80) {
      return raw
        .replace(/\s+/g, " ")
        .replace(/\s+at\s+.+$/i, "")
        .trim();
    }
  }
  return undefined;
}

export function extractCompany(input: {
  readonly subject: string;
  readonly body: string;
  readonly senderEmail: string;
  readonly senderName?: string;
}): string | undefined {
  const haystack = `${input.subject}\n${input.body}`;
  for (const pattern of COMPANY_PATTERNS) {
    const match = haystack.match(pattern);
    const raw = match?.[1]?.trim();
    if (raw && raw.length >= 2 && raw.length <= 60 && !/https?:/i.test(raw)) {
      const cleaned = raw
        .replace(/\s+/g, " ")
        .replace(/\b(inc|llc|ltd|team)\b/gi, "")
        .trim();
      if (cleaned && !/^(the|our|your|this|a|an)$/i.test(cleaned)) {
        return cleaned;
      }
    }
  }
  const domain = emailDomain(input.senderEmail);
  if (!isAtsOrBoardDomain(domain)) {
    const fromDomain = companyFromDomain(domain);
    if (fromDomain) {
      return fromDomain;
    }
  }
  if (input.senderName && !/noreply|no-reply|notifications/i.test(input.senderName)) {
    const via = input.senderName.match(/via\s+(.+)/i)?.[1]?.trim();
    if (via) {
      return via;
    }
  }
  return undefined;
}

export function classifyEmailDeterministic(input: {
  readonly subject: string;
  readonly senderEmail: string;
  readonly senderName?: string;
  readonly snippet: string;
  readonly bodyText?: string;
  readonly direction: "inbound" | "outbound";
}): EmailClassificationResult {
  const body = input.bodyText ?? "";
  const haystack = `${input.subject}\n${input.snippet}\n${body}`;
  const company = extractCompany({
    subject: input.subject,
    body: haystack,
    senderEmail: input.senderEmail,
    senderName: input.senderName,
  });
  const jobTitle = extractJobTitle(input.subject, haystack);
  const importantDates = extractDates(haystack);

  if (input.direction === "outbound" && /\b(application|applied|applying)\b/i.test(haystack)) {
    return {
      isJobRelated: true,
      classification: "job_application",
      confidence: 0.88,
      company,
      jobTitle,
      requiresUserAction: false,
      importantDates,
      source: "deterministic",
    };
  }

  for (const rule of CLASSIFICATION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      const recruiterEmail = /recruiter|talent/i.test(haystack) ? input.senderEmail : undefined;
      return {
        isJobRelated: true,
        classification: rule.classification,
        confidence: rule.confidence,
        company,
        jobTitle,
        recruiterName: recruiterEmail ? input.senderName : undefined,
        recruiterEmail,
        requiresUserAction: rule.requiresUserAction ?? false,
        actionType: rule.actionType,
        importantDates,
        source: "deterministic",
      };
    }
  }

  if (/\b(job|application|interview|recruiter|hiring)\b/i.test(haystack)) {
    return {
      isJobRelated: true,
      classification: "other_job_related",
      confidence: 0.72,
      company,
      jobTitle,
      requiresUserAction: false,
      importantDates,
      source: "deterministic",
    };
  }

  return {
    isJobRelated: false,
    classification: "not_job_related",
    confidence: 0.8,
    requiresUserAction: false,
    source: "deterministic",
  };
}
