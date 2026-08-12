import {
  createApplicationDraft,
  pickLaterLifecycle,
  resolveApplicationView,
  updateApplicationDraft,
  type Application,
  type ApplicationRepository,
} from "@jobjitsu/applications";
import type { EventBus } from "@jobjitsu/events";
import type { ApplicationId } from "@jobjitsu/shared";
import { classifyEmailDeterministic } from "./classify.js";
import { extractUrls } from "./classify.js";
import { companyFromDomain, emailDomain, isAtsOrBoardDomain } from "./domains.js";
import { cheapJobRelatedFilter } from "./filter.js";
import { contentFingerprint } from "./fingerprint.js";
import { pickBestMatch } from "./match.js";
import { buildEmailClassifyUserPrompt } from "./prompts.js";
import { parseClassificationJson } from "./schema.js";
import { listDocs, newLocalId, readDoc, type MailboxStore } from "./store.js";
import {
  classificationToLifecycle,
  classificationToTimelineType,
  confidenceBand,
  type EmailClassificationResult,
  type MailboxAction,
  type MailboxActionPriority,
  type MailboxAiPort,
  type MailboxEmail,
  type MailboxProviderMessage,
  type MailboxTimelineEvent,
} from "./types.js";

const BODY_EXCERPT_CHARS = 1200;
const PROCESS_BATCH = 25;

export type ProcessMailboxOptions = {
  readonly store: MailboxStore;
  readonly applications: ApplicationRepository;
  readonly bus?: EventBus;
  readonly ai?: MailboxAiPort;
  readonly now?: () => Date;
};

export async function ingestProviderMessage(
  store: MailboxStore,
  integrationId: string,
  provider: MailboxEmail["provider"],
  message: MailboxProviderMessage,
): Promise<{ readonly email: MailboxEmail; readonly duplicate: boolean }> {
  const existingId = await store.findEmailId(provider, message.providerMessageId);
  const fingerprint = contentFingerprint({
    subject: message.subject,
    snippet: message.snippet,
    bodyText: message.bodyText,
  });
  const now = new Date().toISOString();
  if (existingId) {
    const current = await readDoc(store.emails, existingId);
    if (current && current.contentFingerprint === fingerprint) {
      return { email: current, duplicate: true };
    }
    const next: MailboxEmail = {
      ...(current ?? {
        id: existingId,
        integrationId,
        provider,
        providerMessageId: message.providerMessageId,
        recipients: message.recipients,
        subject: message.subject,
        direction: message.direction,
        snippet: message.snippet,
        attachmentNames: message.attachmentNames,
        urls: extractUrls(`${message.subject}\n${message.snippet}\n${message.bodyText ?? ""}`),
        contentFingerprint: fingerprint,
        processed: false,
        aiProcessed: false,
        createdAt: now,
        senderEmail: message.senderEmail,
      }),
      threadId: message.threadId,
      senderEmail: message.senderEmail,
      senderName: message.senderName,
      recipients: message.recipients,
      subject: message.subject,
      receivedAt: message.receivedAt,
      sentAt: message.sentAt,
      direction: message.direction,
      snippet: message.snippet,
      bodyText: message.bodyText,
      attachmentNames: message.attachmentNames,
      urls: extractUrls(`${message.subject}\n${message.snippet}\n${message.bodyText ?? ""}`),
      contentFingerprint: fingerprint,
      processed: false,
      aiProcessed: false,
      updatedAt: now,
    };
    await store.emails.put(next);
    return { email: next, duplicate: Boolean(current) };
  }

  const email: MailboxEmail = {
    id: newLocalId("mail"),
    integrationId,
    provider,
    providerMessageId: message.providerMessageId,
    threadId: message.threadId,
    senderEmail: message.senderEmail,
    senderName: message.senderName,
    recipients: message.recipients,
    subject: message.subject,
    receivedAt: message.receivedAt,
    sentAt: message.sentAt,
    direction: message.direction,
    snippet: message.snippet,
    bodyText: message.bodyText,
    attachmentNames: message.attachmentNames,
    urls: extractUrls(`${message.subject}\n${message.snippet}\n${message.bodyText ?? ""}`),
    contentFingerprint: fingerprint,
    processed: false,
    aiProcessed: false,
    createdAt: now,
    updatedAt: now,
  };
  await store.emails.put(email);
  await store.rememberEmailId(provider, message.providerMessageId, email.id);
  return { email, duplicate: false };
}

export async function processUnprocessedEmails(
  options: ProcessMailboxOptions,
): Promise<{
  readonly processed: number;
  readonly jobRelated: number;
  readonly applicationsFound: number;
}> {
  const pending = await options.store.unprocessedEmails();
  let processed = 0;
  let jobRelated = 0;
  let applicationsFound = 0;
  const batch = pending.slice(0, PROCESS_BATCH);
  for (const email of batch) {
    const result = await processOneEmail(options, email);
    processed += 1;
    if (result.jobRelated) {
      jobRelated += 1;
    }
    if (result.createdApplication) {
      applicationsFound += 1;
    }
  }
  return { processed, jobRelated, applicationsFound };
}

async function processOneEmail(
  options: ProcessMailboxOptions,
  email: MailboxEmail,
): Promise<{ readonly jobRelated: boolean; readonly createdApplication: boolean }> {
  const now = (options.now ?? (() => new Date()))().toISOString();
  const filter = cheapJobRelatedFilter({
    subject: email.subject,
    senderEmail: email.senderEmail,
    snippet: email.snippet,
    bodyText: email.bodyText,
  });

  let classification: EmailClassificationResult = classifyEmailDeterministic({
    subject: email.subject,
    senderEmail: email.senderEmail,
    senderName: email.senderName,
    snippet: email.snippet,
    bodyText: email.bodyText,
    direction: email.direction,
  });

  let aiProcessed = email.aiProcessed;
  if (filter.potentiallyJobRelated && options.ai && !email.aiProcessed) {
    try {
      const raw = await options.ai.classify({
        subject: email.subject,
        senderEmail: email.senderEmail,
        senderName: email.senderName,
        snippet: email.snippet,
        bodyExcerpt: email.bodyText?.slice(0, BODY_EXCERPT_CHARS),
      });
      const parsed = parseClassificationJson(raw);
      if (parsed) {
        classification = parsed;
      }
      aiProcessed = true;
    } catch {
      aiProcessed = false;
    }
  }

  if (email.userClassificationOverride) {
    classification = {
      ...classification,
      classification: email.userClassificationOverride,
      isJobRelated: email.userClassificationOverride !== "not_job_related",
    };
  }

  if (!filter.potentiallyJobRelated && !classification.isJobRelated) {
    await options.store.emails.put({
      ...email,
      processed: true,
      aiProcessed,
      isJobRelated: false,
      classification: "not_job_related",
      confidence: classification.confidence,
      updatedAt: now,
    });
    return { jobRelated: false, createdApplication: false };
  }

  const listed = await options.applications.list();
  const classified: MailboxEmail = {
    ...email,
    processed: true,
    aiProcessed,
    isJobRelated: classification.isJobRelated,
    classification: classification.classification,
    confidence: classification.confidence,
    company: classification.company,
    jobTitle: classification.jobTitle,
    recruiterName: classification.recruiterName,
    recruiterEmail: classification.recruiterEmail,
    requiresUserAction: classification.requiresUserAction,
    actionType: classification.actionType,
    importantDates: classification.importantDates,
    updatedAt: now,
  };

  if (!classification.isJobRelated) {
    await options.store.emails.put(classified);
    return { jobRelated: false, createdApplication: false };
  }

  const match = pickBestMatch(classified, listed);
  let applicationId = match.applicationId;
  let createdApplication = false;
  const ambiguous = !match.applicationId && match.score >= 40 && match.score < 70;
  let matchUncertain = match.uncertain || ambiguous;

  if (match.applicationId && !match.uncertain) {
    await linkEmailToApplication(options, match.applicationId, classified, classification);
  } else if (ambiguous) {
    matchUncertain = true;
  } else {
    const created = await createApplicationDraft({
      repository: options.applications,
      bus: options.bus,
      input: {
        companyName: classification.company ?? employerNameFallback(email.senderEmail),
        roleTitle: classification.jobTitle ?? "Unknown role",
        notes: "Created from email on this device. Nothing was sent.",
      },
    });
    applicationId = created.application.id;
    createdApplication = true;
    matchUncertain = false;
    const lifecycle = classificationToLifecycle(classification.classification) ?? "applied";
    await updateApplicationDraft({
      repository: options.applications,
      bus: options.bus,
      patch: {
        id: applicationId,
        source: "email",
        lifecycleStatus: lifecycle,
        companyDomain: employerDomain(email.senderEmail),
        appliedAt: email.sentAt ?? email.receivedAt ?? now.slice(0, 10),
        lastActivityAt: email.receivedAt ?? email.sentAt ?? now,
        recruiterName: classification.recruiterName,
        recruiterEmail: classification.recruiterEmail,
        confidence: classification.confidence,
        linkedEmailIds: [email.id],
        linkedThreadIds: email.threadId ? [email.threadId] : [],
        stage: "send",
      },
    });
  }

  const saved: MailboxEmail = {
    ...classified,
    applicationId,
    matchScore: match.score,
    matchUncertain,
  };
  await options.store.emails.put(saved);

  if (applicationId && !matchUncertain) {
    await maybeWriteTimeline(options, applicationId, saved, classification);
    await maybeWriteAction(options, applicationId, saved, classification);
  }

  return { jobRelated: true, createdApplication };
}

async function linkEmailToApplication(
  options: ProcessMailboxOptions,
  applicationId: ApplicationId,
  email: MailboxEmail,
  classification: EmailClassificationResult,
): Promise<void> {
  const existing = await options.applications.get(applicationId);
  if (!existing) {
    return;
  }
  const resolved = resolveApplicationView(existing);
  const incomingLifecycle = classificationToLifecycle(classification.classification);
  const nextLifecycle =
    existing.userOverrides?.lifecycleStatus ??
    (incomingLifecycle
      ? pickLaterLifecycle(resolved.lifecycleStatus, incomingLifecycle)
      : resolved.lifecycleStatus);
  const linkedEmailIds = unique([...(existing.linkedEmailIds ?? []), email.id]);
  const linkedThreadIds = unique(
    [...(existing.linkedThreadIds ?? []), email.threadId].filter((id): id is string => Boolean(id)),
  );
  await updateApplicationDraft({
    repository: options.applications,
    bus: options.bus,
    patch: {
      id: applicationId,
      lifecycleStatus: existing.userOverrides?.lifecycleStatus ? undefined : nextLifecycle,
      lastActivityAt: email.receivedAt ?? email.sentAt ?? existing.lastActivityAt,
      recruiterName: existing.userOverrides?.recruiterName
        ? undefined
        : (classification.recruiterName ?? existing.recruiterName),
      recruiterEmail: existing.userOverrides?.recruiterEmail
        ? undefined
        : (classification.recruiterEmail ?? existing.recruiterEmail),
      linkedEmailIds,
      linkedThreadIds,
      nextAction: classification.requiresUserAction
        ? actionDescription(classification)
        : existing.nextAction,
      nextActionDueAt:
        classification.importantDates?.assessmentDeadline ?? existing.nextActionDueAt,
    },
  });
}

async function maybeWriteTimeline(
  options: ProcessMailboxOptions,
  applicationId: ApplicationId,
  email: MailboxEmail,
  classification: EmailClassificationResult,
): Promise<void> {
  const type = classificationToTimelineType(classification.classification);
  if (!type) {
    return;
  }
  const listed = await listDocs(options.store.timeline);
  if (listed.some((event) => event.emailId === email.id && event.type === type)) {
    return;
  }
  const event: MailboxTimelineEvent = {
    id: newLocalId("tl"),
    applicationId,
    type,
    at: email.receivedAt ?? email.sentAt ?? email.createdAt,
    summary: timelineSummary(classification, email),
    emailId: email.id,
    confidence: classification.confidence,
    flagged: confidenceBand(classification.confidence) !== "high",
    createdAt: new Date().toISOString(),
  };
  await options.store.timeline.put(event);
}

async function maybeWriteAction(
  options: ProcessMailboxOptions,
  applicationId: ApplicationId,
  email: MailboxEmail,
  classification: EmailClassificationResult,
): Promise<void> {
  if (!classification.requiresUserAction || !classification.actionType) {
    return;
  }
  const listed = await listDocs(options.store.actions);
  if (listed.some((action) => action.emailId === email.id && !action.completed)) {
    return;
  }
  const dueAt =
    classification.importantDates?.assessmentDeadline ??
    classification.importantDates?.interviewDate ??
    classification.importantDates?.responseDeadline;
  const action: MailboxAction = {
    id: newLocalId("act"),
    applicationId,
    emailId: email.id,
    actionType: classification.actionType,
    priority: actionPriority(dueAt, classification.actionType),
    description: actionDescription(classification),
    dueAt,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await options.store.actions.put(action);
}

function actionDescription(classification: EmailClassificationResult): string {
  switch (classification.actionType) {
    case "complete_assessment":
      return "Complete the technical assessment";
    case "schedule_interview":
      return "Schedule the interview";
    case "reply_to_recruiter":
      return "Reply to the recruiter";
    case "send_resume":
      return "Send an updated résumé";
    case "review_offer":
      return "Review the offer";
    case "follow_up":
      return "Consider a follow-up (nothing is sent unless you choose to)";
    default:
      return "This application needs a response from you";
  }
}

function actionPriority(dueAt: string | undefined, actionType: string): MailboxActionPriority {
  if (actionType === "complete_assessment" || actionType === "review_offer") {
    return "high";
  }
  if (dueAt) {
    const due = Date.parse(dueAt);
    if (Number.isFinite(due) && due - Date.now() < 48 * 60 * 60 * 1000) {
      return "high";
    }
  }
  return "medium";
}

function timelineSummary(classification: EmailClassificationResult, email: MailboxEmail): string {
  const company = classification.company ?? "this company";
  const role = classification.jobTitle;
  switch (classification.classification) {
    case "job_application":
      return role ? `Applied for ${role}` : `Applied at ${company}`;
    case "application_confirmation":
      return "Application confirmation received";
    case "recruiter_message":
      return "Recruiter contacted you";
    case "assessment":
      return "Technical assessment received";
    case "assessment_confirmation":
      return "Assessment submitted";
    case "interview_invitation":
      return "Interview invitation received";
    case "interview_confirmation":
    case "interview_reschedule":
      return "Interview scheduled";
    case "rejection":
      return "Application not moving forward";
    case "offer":
      return "Offer received";
    default:
      return email.subject;
  }
}

function employerDomain(senderEmail: string): string | undefined {
  const domain = emailDomain(senderEmail);
  if (!domain || isAtsOrBoardDomain(domain)) {
    return undefined;
  }
  return domain.toLowerCase();
}

function employerNameFallback(senderEmail: string): string {
  const domain = emailDomain(senderEmail);
  return companyFromDomain(domain) ?? "Unknown company";
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function classifyPromptFor(email: MailboxEmail): string {
  return buildEmailClassifyUserPrompt({
    subject: email.subject,
    senderEmail: email.senderEmail,
    senderName: email.senderName,
    snippet: email.snippet,
    bodyExcerpt: email.bodyText?.slice(0, BODY_EXCERPT_CHARS),
  });
}

export type { Application };
