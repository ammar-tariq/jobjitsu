/** Versioned mailbox Agent prompts — host-owned complete(); UI never calls AI. */

export const MAILBOX_PROMPT_VERSION = "mailbox-prompts.v1";

export const EMAIL_CLASSIFY_PROMPT_VERSION = `${MAILBOX_PROMPT_VERSION}.classify`;

export const EMAIL_CLASSIFY_SYSTEM_PROMPT = `You classify career-related email. Return JSON only. No markdown.

Schema:
{
  "isJobRelated": boolean,
  "classification": "job_application" | "application_confirmation" | "recruiter_message" | "assessment" | "assessment_confirmation" | "interview_invitation" | "interview_confirmation" | "interview_reschedule" | "rejection" | "offer" | "follow_up" | "request_for_information" | "withdrawal" | "other_job_related" | "not_job_related",
  "confidence": number,
  "company": string | null,
  "jobTitle": string | null,
  "recruiterName": string | null,
  "recruiterEmail": string | null,
  "requiresUserAction": boolean,
  "actionType": "complete_assessment" | "schedule_interview" | "reply_to_recruiter" | "send_resume" | "follow_up" | "review_offer" | "other" | null,
  "importantDates": {
    "applicationDate": string | null,
    "assessmentDeadline": string | null,
    "interviewDate": string | null,
    "responseDeadline": string | null,
    "offerExpiration": string | null,
    "followUpDate": string | null
  }
}

Rules:
- confidence is 0–1.
- Do not invent a company from an ATS sender (Greenhouse, Lever, Workday, Ashby, LinkedIn, Indeed). Read the hiring company from subject or body.
- Recruiter agency domain may differ from the hiring company.
- One company can have multiple roles — extract the specific job title.
- requiresUserAction is true only when the candidate must do something (assessment, schedule, reply, send a document, review an offer).
- Never recommend sending mail automatically.`;

export function buildEmailClassifyUserPrompt(input: {
  readonly subject: string;
  readonly senderEmail: string;
  readonly senderName?: string;
  readonly snippet: string;
  readonly bodyExcerpt?: string;
}): string {
  const lines = [
    `Subject: ${input.subject}`,
    `From: ${input.senderName ? `${input.senderName} <${input.senderEmail}>` : input.senderEmail}`,
    `Snippet: ${input.snippet}`,
  ];
  if (input.bodyExcerpt) {
    lines.push(`Body excerpt: ${input.bodyExcerpt}`);
  }
  return lines.join("\n");
}

export const APPLICATION_MATCH_PROMPT_VERSION = `${MAILBOX_PROMPT_VERSION}.match`;

export const APPLICATION_MATCH_SYSTEM_PROMPT = `You decide whether an email belongs to an existing job application. Return JSON only.

Schema:
{
  "applicationId": string | null,
  "confidence": number,
  "reason": string
}

Rules:
- Same company + different job title = different applications.
- Recruiter email alone is not enough to match.
- If unsure, applicationId must be null.`;

export const STATUS_EXTRACT_PROMPT_VERSION = `${MAILBOX_PROMPT_VERSION}.status`;

export const STATUS_EXTRACT_SYSTEM_PROMPT = `You infer the current application lifecycle from an email. Return JSON only.

Schema:
{
  "lifecycleStatus": "applied" | "application_confirmed" | "recruiter_contacted" | "assessment_received" | "assessment_pending" | "assessment_completed" | "interview_requested" | "interview_scheduled" | "interview_completed" | "offer_received" | "accepted" | "rejected" | "withdrawn" | "no_response" | "unknown",
  "nextAction": string | null,
  "confidence": number
}

Do not recommend sending mail. Suggest drafts only as nextAction text.`;
