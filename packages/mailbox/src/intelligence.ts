import {
  findPossibleDuplicateApplications,
  resolveApplicationView,
  type Application,
} from "@jobjitsu/applications";
import type { ApplicationId } from "@jobjitsu/shared";
import type { MailboxStore } from "./store.js";
import type {
  MailboxAction,
  MailboxAnalytics,
  MailboxDashboardSummary,
  MailboxDuplicatePair,
  MailboxFunnel,
  MailboxSettings,
} from "./types.js";

const ACTIVE_STATUSES = new Set([
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
  "no_response",
  "unknown",
]);

const INTERVIEW_STATUSES = new Set([
  "interview_requested",
  "interview_scheduled",
  "interview_completed",
]);

const ASSESSMENT_STATUSES = new Set([
  "assessment_received",
  "assessment_pending",
  "assessment_completed",
]);

const RESPONSE_STATUSES = new Set([
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
]);

export function summarizeApplications(
  applications: readonly Application[],
  actions: readonly MailboxAction[],
): MailboxDashboardSummary {
  const live = applications.filter((app) => !app.archived && !app.mergedIntoId);
  const openActions = actions.filter((action) => !action.completed);
  return {
    totalApplications: live.length,
    activeApplications: live.filter((app) => ACTIVE_STATUSES.has(statusOf(app) ?? "unknown"))
      .length,
    interviews: live.filter((app) => INTERVIEW_STATUSES.has(statusOf(app) ?? "")).length,
    assessments: live.filter((app) => ASSESSMENT_STATUSES.has(statusOf(app) ?? "")).length,
    offers: live.filter((app) => statusOf(app) === "offer_received" || statusOf(app) === "accepted")
      .length,
    rejected: live.filter((app) => statusOf(app) === "rejected").length,
    awaitingResponse: live.filter(
      (app) => statusOf(app) === "no_response" || statusOf(app) === "applied",
    ).length,
    actionsRequired: openActions.length,
  };
}

export function applicationFunnel(applications: readonly Application[]): MailboxFunnel {
  const live = applications.filter((app) => !app.archived && !app.mergedIntoId);
  return {
    applied: live.length,
    responses: live.filter((app) => RESPONSE_STATUSES.has(statusOf(app) ?? "")).length,
    interviews: live.filter((app) => INTERVIEW_STATUSES.has(statusOf(app) ?? "")).length,
    offers: live.filter((app) => statusOf(app) === "offer_received" || statusOf(app) === "accepted")
      .length,
  };
}

export function detectNoResponseApplications(
  applications: readonly Application[],
  settings: MailboxSettings,
  now = new Date(),
): readonly Application[] {
  const cutoff = now.getTime() - settings.noResponseAfterDays * 24 * 60 * 60 * 1000;
  return applications.filter((app) => {
    if (app.archived || app.mergedIntoId) {
      return false;
    }
    const status = statusOf(app);
    if (
      status &&
      status !== "applied" &&
      status !== "no_response" &&
      status !== "application_confirmed"
    ) {
      return false;
    }
    const applied = Date.parse(app.appliedAt ?? app.createdAt);
    const last = Date.parse(app.lastActivityAt ?? app.appliedAt ?? app.createdAt);
    if (!Number.isFinite(applied)) {
      return false;
    }
    const inboundAfterApply = Number.isFinite(last) && last > applied + 60_000;
    if (inboundAfterApply && status !== "applied" && status !== "no_response") {
      return false;
    }
    return applied <= cutoff && !inboundAfterApply;
  });
}

export function followUpRecommendation(application: Application, silentDays: number): string {
  const company = resolveApplicationView(application).companyName;
  return `${company} — no response for ${silentDays} day${silentDays === 1 ? "" : "s"}. Consider a short follow-up. Nothing is sent unless you choose to.`;
}

export function detectDuplicatePairs(
  applications: readonly Application[],
): readonly MailboxDuplicatePair[] {
  const live = applications.filter((app) => !app.archived && !app.mergedIntoId);
  const pairs: MailboxDuplicatePair[] = [];
  const seen = new Set<string>();
  for (const app of live) {
    const matches = findPossibleDuplicateApplications(live, app);
    for (const other of matches) {
      const key = [app.id, other.id].sort().join(":");
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      pairs.push({
        leftId: app.id,
        rightId: other.id,
        companyName: resolveApplicationView(app).companyName,
        leftRole: resolveApplicationView(app).roleTitle,
        rightRole: resolveApplicationView(other).roleTitle,
      });
    }
  }
  return pairs;
}

export function computeAnalytics(
  applications: readonly Application[],
  windowDays = 30,
  now = new Date(),
): MailboxAnalytics {
  const since = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const live = applications.filter((app) => !app.archived && !app.mergedIntoId);
  const inWindow = live.filter((app) => Date.parse(app.appliedAt ?? app.createdAt) >= since);
  const applicationsCount = inWindow.length || live.length;
  const pool = inWindow.length > 0 ? inWindow : live;
  const responses = pool.filter((app) => RESPONSE_STATUSES.has(statusOf(app) ?? "")).length;
  const interviews = pool.filter((app) => INTERVIEW_STATUSES.has(statusOf(app) ?? "")).length;
  const assessments = pool.filter((app) => ASSESSMENT_STATUSES.has(statusOf(app) ?? "")).length;
  const offers = pool.filter(
    (app) => statusOf(app) === "offer_received" || statusOf(app) === "accepted",
  ).length;
  const rejections = pool.filter((app) => statusOf(app) === "rejected").length;
  const rate = (count: number) =>
    applicationsCount === 0 ? 0 : Math.round((count / applicationsCount) * 100);
  return {
    windowDays,
    applications: applicationsCount,
    responses,
    responseRate: rate(responses),
    interviews,
    interviewRate: rate(interviews),
    assessments,
    assessmentRate: rate(assessments),
    offers,
    offerRate: rate(offers),
    rejections,
    rejectionRate: rate(rejections),
  };
}

export function silentDays(application: Application, now = new Date()): number {
  const last = Date.parse(
    application.lastActivityAt ?? application.appliedAt ?? application.createdAt,
  );
  if (!Number.isFinite(last)) {
    return 0;
  }
  return Math.max(0, Math.floor((now.getTime() - last) / (24 * 60 * 60 * 1000)));
}

export async function listOpenActions(store: MailboxStore): Promise<readonly MailboxAction[]> {
  const result = await store.actions.list();
  if (!result.ok) {
    return [];
  }
  return result.value
    .filter((action) => !action.completed)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

function priorityRank(priority: MailboxAction["priority"]): number {
  if (priority === "high") {
    return 0;
  }
  if (priority === "medium") {
    return 1;
  }
  return 2;
}

function statusOf(application: Application): string | undefined {
  return resolveApplicationView(application).lifecycleStatus;
}

export type { ApplicationId };
