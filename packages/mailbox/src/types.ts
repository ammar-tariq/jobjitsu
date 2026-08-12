import type { ApplicationLifecycleStatus } from "@jobjitsu/applications";
import type { ApplicationId } from "@jobjitsu/shared";

export const MAILBOX_PROVIDERS = ["fake", "gmail", "outlook"] as const;

export type MailboxProviderId = (typeof MAILBOX_PROVIDERS)[number];

export const EMAIL_DIRECTIONS = ["inbound", "outbound"] as const;

export type EmailDirection = (typeof EMAIL_DIRECTIONS)[number];

export const EMAIL_CLASSIFICATIONS = [
  "job_application",
  "application_confirmation",
  "recruiter_message",
  "assessment",
  "assessment_confirmation",
  "interview_invitation",
  "interview_confirmation",
  "interview_reschedule",
  "rejection",
  "offer",
  "follow_up",
  "request_for_information",
  "withdrawal",
  "other_job_related",
  "not_job_related",
] as const;

export type EmailClassification = (typeof EMAIL_CLASSIFICATIONS)[number];

export const MAILBOX_ACTION_TYPES = [
  "complete_assessment",
  "schedule_interview",
  "reply_to_recruiter",
  "send_resume",
  "follow_up",
  "review_offer",
  "other",
] as const;

export type MailboxActionType = (typeof MAILBOX_ACTION_TYPES)[number];

export const MAILBOX_ACTION_PRIORITIES = ["high", "medium", "low"] as const;

export type MailboxActionPriority = (typeof MAILBOX_ACTION_PRIORITIES)[number];

export const TIMELINE_EVENT_TYPES = [
  "application_sent",
  "application_confirmed",
  "recruiter_contact",
  "assessment_received",
  "assessment_completed",
  "interview_invited",
  "interview_scheduled",
  "interview_completed",
  "rejection",
  "offer",
  "follow_up",
  "user_action_required",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export const CONFIDENCE_HIGH = 0.9;
export const CONFIDENCE_MEDIUM = 0.7;

export type ConfidenceBand = "high" | "medium" | "uncertain";

export function confidenceBand(value: number): ConfidenceBand {
  if (value >= CONFIDENCE_HIGH) {
    return "high";
  }
  if (value >= CONFIDENCE_MEDIUM) {
    return "medium";
  }
  return "uncertain";
}

export type MailboxIntegration = {
  readonly id: string;
  readonly provider: MailboxProviderId;
  readonly label: string;
  readonly emailAddress?: string;
  readonly connected: boolean;
  readonly connectedAt: string;
  readonly lastSyncedAt?: string;
  readonly syncStatus: MailboxSyncStatus;
  readonly syncError?: string;
  readonly lookbackDays: number;
  readonly emailsProcessed: number;
  readonly emailsTotal?: number;
  readonly jobRelatedCount: number;
  readonly applicationsFound: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MailboxSyncStatus =
  | "idle"
  | "syncing"
  | "processing"
  | "needs_consent"
  | "needs_client_id"
  | "token_expired"
  | "failed"
  | "disconnected";

export type MailboxEmail = {
  readonly id: string;
  readonly integrationId: string;
  readonly provider: MailboxProviderId;
  readonly providerMessageId: string;
  readonly threadId?: string;
  readonly senderEmail: string;
  readonly senderName?: string;
  readonly recipients: readonly string[];
  readonly subject: string;
  readonly receivedAt?: string;
  readonly sentAt?: string;
  readonly direction: EmailDirection;
  readonly snippet: string;
  readonly bodyText?: string;
  readonly attachmentNames: readonly string[];
  readonly urls: readonly string[];
  readonly contentFingerprint: string;
  readonly processed: boolean;
  readonly aiProcessed: boolean;
  readonly classification?: EmailClassification;
  readonly isJobRelated?: boolean;
  readonly confidence?: number;
  readonly company?: string;
  readonly jobTitle?: string;
  readonly recruiterName?: string;
  readonly recruiterEmail?: string;
  readonly requiresUserAction?: boolean;
  readonly actionType?: MailboxActionType;
  readonly importantDates?: MailboxExtractedDates;
  readonly applicationId?: ApplicationId;
  readonly matchScore?: number;
  readonly matchUncertain?: boolean;
  readonly userClassificationOverride?: EmailClassification;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MailboxExtractedDates = {
  readonly applicationDate?: string;
  readonly assessmentDeadline?: string;
  readonly interviewDate?: string;
  readonly responseDeadline?: string;
  readonly offerExpiration?: string;
  readonly followUpDate?: string;
};

export type MailboxAction = {
  readonly id: string;
  readonly applicationId?: ApplicationId;
  readonly emailId?: string;
  readonly actionType: MailboxActionType;
  readonly priority: MailboxActionPriority;
  readonly description: string;
  readonly dueAt?: string;
  readonly completed: boolean;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MailboxTimelineEvent = {
  readonly id: string;
  readonly applicationId: ApplicationId;
  readonly type: TimelineEventType;
  readonly at: string;
  readonly summary: string;
  readonly emailId?: string;
  readonly confidence: number;
  readonly flagged: boolean;
  readonly createdAt: string;
};

export type MailboxOAuthTokens = {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string;
  readonly tokenType?: string;
  readonly scope?: string;
};

export type MailboxSettings = {
  readonly gmailClientId?: string;
  readonly gmailClientSecret?: string;
  readonly outlookClientId?: string;
  readonly lookbackDays: number;
  readonly noResponseAfterDays: number;
  readonly notifyAssessments: boolean;
  readonly notifyInterviews: boolean;
  readonly notifyRejections: boolean;
  readonly notifyOffers: boolean;
  readonly dismissedDuplicateKeys: readonly string[];
};

export const DEFAULT_MAILBOX_SETTINGS: MailboxSettings = {
  lookbackDays: 365,
  noResponseAfterDays: 7,
  notifyAssessments: true,
  notifyInterviews: true,
  notifyRejections: true,
  notifyOffers: true,
  dismissedDuplicateKeys: [],
};

export type EmailClassificationResult = {
  readonly isJobRelated: boolean;
  readonly classification: EmailClassification;
  readonly confidence: number;
  readonly company?: string;
  readonly jobTitle?: string;
  readonly recruiterName?: string;
  readonly recruiterEmail?: string;
  readonly requiresUserAction: boolean;
  readonly actionType?: MailboxActionType;
  readonly importantDates?: MailboxExtractedDates;
  readonly source: "deterministic" | "ai";
};

export type ApplicationMatchResult = {
  readonly applicationId?: ApplicationId;
  readonly score: number;
  readonly uncertain: boolean;
  readonly reasons: readonly string[];
};

export type MailboxDashboardSummary = {
  readonly totalApplications: number;
  readonly activeApplications: number;
  readonly interviews: number;
  readonly assessments: number;
  readonly offers: number;
  readonly rejected: number;
  readonly awaitingResponse: number;
  readonly actionsRequired: number;
};

export type MailboxFunnel = {
  readonly applied: number;
  readonly responses: number;
  readonly interviews: number;
  readonly offers: number;
};

export type MailboxAnalytics = {
  readonly windowDays: number;
  readonly applications: number;
  readonly responses: number;
  readonly responseRate: number;
  readonly interviews: number;
  readonly interviewRate: number;
  readonly assessments: number;
  readonly assessmentRate: number;
  readonly offers: number;
  readonly offerRate: number;
  readonly rejections: number;
  readonly rejectionRate: number;
  readonly averageResponseDays?: number;
  readonly averageApplyToInterviewDays?: number;
  readonly averageInterviewToDecisionDays?: number;
};

export type MailboxDuplicatePair = {
  readonly leftId: ApplicationId;
  readonly rightId: ApplicationId;
  readonly companyName: string;
  readonly leftRole: string;
  readonly rightRole: string;
};

export type MailboxProviderMessage = {
  readonly providerMessageId: string;
  readonly threadId?: string;
  readonly senderEmail: string;
  readonly senderName?: string;
  readonly recipients: readonly string[];
  readonly subject: string;
  readonly receivedAt?: string;
  readonly sentAt?: string;
  readonly direction: EmailDirection;
  readonly snippet: string;
  readonly bodyText?: string;
  readonly attachmentNames: readonly string[];
};

export type MailboxListPage = {
  readonly messages: readonly MailboxProviderMessage[];
  readonly nextCursor?: string;
  readonly totalEstimate?: number;
  readonly historyCursor?: string;
};

/**
 * Durable sync pointer — survives app restart. Host-only; never sent over IPC.
 * After the first complete sync, later runs use watermark / historyCursor only.
 */
export type MailboxSyncCheckpoint = {
  readonly id: string;
  readonly initialComplete: boolean;
  readonly pageCursor?: string;
  readonly historyCursor?: string;
  readonly watermark?: string;
  readonly updatedAt: string;
};

export type MailboxAiPort = {
  classify(input: {
    readonly subject: string;
    readonly senderEmail: string;
    readonly senderName?: string;
    readonly snippet: string;
    readonly bodyExcerpt?: string;
  }): Promise<unknown>;
};

export function classificationToLifecycle(
  classification: EmailClassification,
): ApplicationLifecycleStatus | undefined {
  switch (classification) {
    case "job_application":
      return "applied";
    case "application_confirmation":
      return "application_confirmed";
    case "recruiter_message":
      return "recruiter_contacted";
    case "assessment":
      return "assessment_received";
    case "assessment_confirmation":
      return "assessment_completed";
    case "interview_invitation":
      return "interview_requested";
    case "interview_confirmation":
    case "interview_reschedule":
      return "interview_scheduled";
    case "rejection":
      return "rejected";
    case "offer":
      return "offer_received";
    case "withdrawal":
      return "withdrawn";
    case "follow_up":
    case "request_for_information":
    case "other_job_related":
    case "not_job_related":
      return undefined;
  }
}

export function classificationToTimelineType(
  classification: EmailClassification,
): TimelineEventType | undefined {
  switch (classification) {
    case "job_application":
      return "application_sent";
    case "application_confirmation":
      return "application_confirmed";
    case "recruiter_message":
      return "recruiter_contact";
    case "assessment":
      return "assessment_received";
    case "assessment_confirmation":
      return "assessment_completed";
    case "interview_invitation":
      return "interview_invited";
    case "interview_confirmation":
    case "interview_reschedule":
      return "interview_scheduled";
    case "rejection":
      return "rejection";
    case "offer":
      return "offer";
    case "follow_up":
      return "follow_up";
    case "request_for_information":
      return "user_action_required";
    case "withdrawal":
    case "other_job_related":
    case "not_job_related":
      return undefined;
  }
}
