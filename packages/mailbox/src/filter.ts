/**
 * Cheap deterministic filter — drop obvious non-job mail before any Agent call.
 */

const NEWSLETTER_HINTS = [
  "unsubscribe",
  "view in browser",
  "you are receiving this",
  "manage preferences",
  "email preferences",
];

const MARKETING_SENDERS = [
  "noreply@",
  "no-reply@",
  "donotreply@",
  "notifications@",
  "newsletter@",
  "marketing@",
  "promo@",
  "deals@",
];

const SOCIAL_DOMAINS = [
  "facebookmail.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "nextdoor.com",
];

const RECEIPT_HINTS = ["order confirmation", "your receipt", "payment received", "invoice #"];

const JOB_POSITIVE_HINTS = [
  "application",
  "applied",
  "applicant",
  "interview",
  "recruiter",
  "hiring",
  "assessment",
  "hackerrank",
  "codility",
  "codesignal",
  "take-home",
  "take home",
  "offer letter",
  "we regret",
  "unfortunately",
  "moved forward",
  "next steps",
  "job",
  "role",
  "position",
  "career",
  "talent",
  "greenhouse",
  "lever",
  "ashby",
  "workday",
];

export type CheapFilterResult = {
  readonly potentiallyJobRelated: boolean;
  readonly reason: string;
};

export function cheapJobRelatedFilter(input: {
  readonly subject: string;
  readonly senderEmail: string;
  readonly snippet: string;
  readonly bodyText?: string;
}): CheapFilterResult {
  const haystack = `${input.subject}\n${input.snippet}\n${input.bodyText ?? ""}`.toLowerCase();
  const sender = input.senderEmail.toLowerCase();
  const domain = sender.split("@")[1] ?? "";

  if (
    NEWSLETTER_HINTS.some((hint) => haystack.includes(hint)) &&
    !JOB_POSITIVE_HINTS.some((h) => haystack.includes(h))
  ) {
    return { potentiallyJobRelated: false, reason: "newsletter" };
  }
  if (RECEIPT_HINTS.some((hint) => haystack.includes(hint))) {
    return { potentiallyJobRelated: false, reason: "receipt" };
  }
  if (
    SOCIAL_DOMAINS.some((d) => domain.endsWith(d)) &&
    !haystack.includes("job") &&
    !haystack.includes("application")
  ) {
    return { potentiallyJobRelated: false, reason: "social" };
  }
  if (
    MARKETING_SENDERS.some((prefix) => sender.startsWith(prefix)) &&
    !JOB_POSITIVE_HINTS.some((h) => haystack.includes(h))
  ) {
    return { potentiallyJobRelated: false, reason: "marketing-sender" };
  }
  if (JOB_POSITIVE_HINTS.some((hint) => haystack.includes(hint))) {
    return { potentiallyJobRelated: true, reason: "job-hint" };
  }
  return { potentiallyJobRelated: false, reason: "no-job-signal" };
}
