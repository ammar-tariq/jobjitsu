/**
 * Post-send application lifecycle — distinct from prep `PIPELINE_STAGES`.
 * Evidence comes from email intelligence; users may override.
 * @see docs/architecture/DATA_MODELS.md
 */
export const APPLICATION_LIFECYCLE_STATUSES = [
  "applied",
  "application_confirmed",
  "recruiter_contacted",
  "assessment_received",
  "assessment_pending",
  "assessment_completed",
  "interview_requested",
  "interview_scheduled",
  "interview_completed",
  "offer_received",
  "accepted",
  "rejected",
  "withdrawn",
  "no_response",
  "unknown",
] as const;

export type ApplicationLifecycleStatus = (typeof APPLICATION_LIFECYCLE_STATUSES)[number];

/** Later ranks win when deriving status from a timeline. */
export const LIFECYCLE_RANK: Record<ApplicationLifecycleStatus, number> = {
  unknown: 0,
  applied: 10,
  no_response: 12,
  application_confirmed: 20,
  recruiter_contacted: 30,
  assessment_received: 40,
  assessment_pending: 45,
  assessment_completed: 50,
  interview_requested: 60,
  interview_scheduled: 70,
  interview_completed: 80,
  offer_received: 90,
  accepted: 100,
  rejected: 95,
  withdrawn: 96,
};

export const APPLICATION_SOURCES = ["manual", "email"] as const;

export type ApplicationSource = (typeof APPLICATION_SOURCES)[number];

export function isApplicationLifecycleStatus(value: string): value is ApplicationLifecycleStatus {
  return (APPLICATION_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

export function lifecycleLabel(status: ApplicationLifecycleStatus): string {
  switch (status) {
    case "applied":
      return "Applied";
    case "application_confirmed":
      return "Application confirmed";
    case "recruiter_contacted":
      return "Recruiter contacted";
    case "assessment_received":
      return "Assessment received";
    case "assessment_pending":
      return "Assessment pending";
    case "assessment_completed":
      return "Assessment completed";
    case "interview_requested":
      return "Interview requested";
    case "interview_scheduled":
      return "Interview scheduled";
    case "interview_completed":
      return "Interview completed";
    case "offer_received":
      return "Offer received";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    case "no_response":
      return "Awaiting response";
    case "unknown":
      return "Unknown";
  }
}

export function pickLaterLifecycle(
  current: ApplicationLifecycleStatus | undefined,
  incoming: ApplicationLifecycleStatus,
): ApplicationLifecycleStatus {
  if (!current) {
    return incoming;
  }
  return LIFECYCLE_RANK[incoming] >= LIFECYCLE_RANK[current] ? incoming : current;
}
