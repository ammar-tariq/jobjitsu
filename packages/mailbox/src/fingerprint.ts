import type { MailboxProviderMessage } from "./types.js";

/** Portable content hash — host and Vite renderer both import this module. */
export function contentFingerprint(input: {
  readonly subject: string;
  readonly snippet: string;
  readonly bodyText?: string;
}): string {
  const text = `${input.subject}\n${input.snippet}\n${input.bodyText ?? ""}`;
  return `${fnv1a32(text).toString(16).padStart(8, "0")}${fnv1a32(`${text.length}:${text}`)
    .toString(16)
    .padStart(8, "0")}`;
}

function fnv1a32(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const SAMPLE_MAILBOX_MESSAGES: readonly MailboxProviderMessage[] = [
  {
    providerMessageId: "fake-1",
    threadId: "thread-acme-rn",
    senderEmail: "you@example.com",
    senderName: "You",
    recipients: ["jobs@acme.example"],
    subject: "Application for Senior React Native Engineer",
    sentAt: "2026-08-02T14:00:00.000Z",
    direction: "outbound",
    snippet: "Please find my application for Senior React Native Engineer at Acme.",
    bodyText: "Hello Acme team, I am applying for Senior React Native Engineer.",
    attachmentNames: ["resume.pdf"],
  },
  {
    providerMessageId: "fake-2",
    threadId: "thread-acme-rn",
    senderEmail: "noreply@mail.greenhouse.io",
    senderName: "Acme via Greenhouse",
    recipients: ["you@example.com"],
    subject: "Your application at Acme",
    receivedAt: "2026-08-03T09:00:00.000Z",
    direction: "inbound",
    snippet:
      "Thank you for applying. We have received your application for Senior React Native Engineer.",
    bodyText:
      "Thank you for applying. We have received your application for Senior React Native Engineer at Acme Inc.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-3",
    threadId: "thread-acme-rn",
    senderEmail: "jordan@acme.example",
    senderName: "Jordan Lee",
    recipients: ["you@example.com"],
    subject: "Update regarding your application",
    receivedAt: "2026-08-06T15:00:00.000Z",
    direction: "inbound",
    snippet:
      "I am a recruiter on the Acme talent team regarding your Senior React Native Engineer application.",
    bodyText:
      "I am a recruiter on the Acme talent team regarding your Senior React Native Engineer application. Next steps soon.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-4",
    threadId: "thread-acme-rn",
    senderEmail: "assessments@hackerrank.com",
    senderName: "HackerRank",
    recipients: ["you@example.com"],
    subject: "Technical Assessment",
    receivedAt: "2026-08-08T11:00:00.000Z",
    direction: "inbound",
    snippet: "You have been invited to complete a HackerRank assessment. Due 2026-08-18.",
    bodyText:
      "You have been invited to complete a HackerRank assessment for Senior React Native Engineer at Acme. Deadline 2026-08-18. https://hackerrank.com/test/acme-rn",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-5",
    threadId: "thread-acme-rn",
    senderEmail: "jordan@acme.example",
    senderName: "Jordan Lee",
    recipients: ["you@example.com"],
    subject: "Interview with our engineering team",
    receivedAt: "2026-08-12T16:00:00.000Z",
    direction: "inbound",
    snippet: "Please select a time using the following link.",
    bodyText:
      "Please select a time using the following Calendly link for your interview: https://calendly.com/acme/eng",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-6",
    threadId: "thread-xyz-fs",
    senderEmail: "talent@companyx.example",
    senderName: "Sam Rivera",
    recipients: ["you@example.com"],
    subject: "Full Stack Engineer — availability?",
    receivedAt: "2026-08-10T13:00:00.000Z",
    direction: "inbound",
    snippet: "Please provide your availability for a chat about Full Stack Engineer.",
    bodyText:
      "Please provide your availability this week regarding the Full Stack Engineer role at Company X.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-7",
    threadId: "thread-y-ai",
    senderEmail: "hiring@companyy.example",
    senderName: "Hiring at Company Y",
    recipients: ["you@example.com"],
    subject: "Interview scheduling link — AI Engineer",
    receivedAt: "2026-08-11T10:00:00.000Z",
    direction: "inbound",
    snippet: "Please select a time using the following link for AI Engineer.",
    bodyText:
      "Interview scheduling link for AI Engineer at Company Y: https://calendly.com/companyy/ai",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-8",
    threadId: "thread-reject",
    senderEmail: "jobs@northwind.example",
    senderName: "Northwind Recruiting",
    recipients: ["you@example.com"],
    subject: "Update on your application",
    receivedAt: "2026-08-09T12:00:00.000Z",
    direction: "inbound",
    snippet: "We regret to inform you we will not be moving forward.",
    bodyText:
      "We regret to inform you we will not be moving forward with your Software Engineer application at Northwind.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-9",
    threadId: "thread-offer",
    senderEmail: "offers@bright.example",
    senderName: "Bright People",
    recipients: ["you@example.com"],
    subject: "Offer letter — Platform Engineer",
    receivedAt: "2026-08-12T18:00:00.000Z",
    direction: "inbound",
    snippet: "We are pleased to offer you the Platform Engineer role.",
    bodyText:
      "We are pleased to offer you the Platform Engineer role at Bright. Offer letter attached.",
    attachmentNames: ["offer-letter.pdf"],
  },
  {
    providerMessageId: "fake-10",
    threadId: "thread-newsletter",
    senderEmail: "newsletter@techweekly.example",
    senderName: "Tech Weekly",
    recipients: ["you@example.com"],
    subject: "This week in JavaScript",
    receivedAt: "2026-08-01T08:00:00.000Z",
    direction: "inbound",
    snippet: "Unsubscribe if you no longer wish to receive this newsletter.",
    bodyText: "View in browser. Unsubscribe. Manage preferences.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-11",
    threadId: "thread-acme-em",
    senderEmail: "jobs@acme.example",
    senderName: "Acme Jobs",
    recipients: ["you@example.com"],
    subject: "Application received — Engineering Manager",
    receivedAt: "2026-08-04T11:00:00.000Z",
    direction: "inbound",
    snippet:
      "Thank you for applying. We have received your application for Engineering Manager at Acme.",
    bodyText:
      "Thank you for applying. We have received your application for Engineering Manager at Acme Inc.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-12",
    threadId: "thread-agency",
    senderEmail: "pat@hirebridge.example",
    senderName: "Pat Chen",
    recipients: ["you@example.com"],
    subject: "Role at Globex — Mobile Engineer",
    receivedAt: "2026-08-05T17:00:00.000Z",
    direction: "inbound",
    snippet: "I recruit for Globex. Are you open to a Mobile Engineer conversation?",
    bodyText:
      "I am a recruiter at Hirebridge. This is about a Mobile Engineer role at Globex, not Hirebridge itself.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-13",
    threadId: "thread-silent",
    senderEmail: "you@example.com",
    senderName: "You",
    recipients: ["careers@quietco.example"],
    subject: "Application for Data Engineer",
    sentAt: "2026-07-20T14:00:00.000Z",
    direction: "outbound",
    snippet: "I applied for Data Engineer at QuietCo.",
    bodyText: "Hello QuietCo, I submitted my application for Data Engineer.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-14",
    threadId: "thread-acme-rn-dup",
    senderEmail: "you@example.com",
    senderName: "You",
    recipients: ["jobs@acme.example"],
    subject: "Application for Senior React Native Developer",
    sentAt: "2026-08-03T10:00:00.000Z",
    direction: "outbound",
    snippet: "Applying again for Senior React Native Developer at Acme.",
    bodyText: "Application for Senior React Native Developer at Acme Inc.",
    attachmentNames: [],
  },
  {
    providerMessageId: "fake-15",
    threadId: "thread-forward",
    senderEmail: "friend@example.com",
    senderName: "A Friend",
    recipients: ["you@example.com"],
    subject: "Fwd: Interview with our engineering team",
    receivedAt: "2026-08-12T19:00:00.000Z",
    direction: "inbound",
    snippet: "Forwarded message: Please select a time using the following link.",
    bodyText:
      "---------- Forwarded message ----------\nFrom: Jordan Lee <jordan@acme.example>\nPlease select a time using the following Calendly link for Senior React Native Engineer at Acme.",
    attachmentNames: [],
  },
];
