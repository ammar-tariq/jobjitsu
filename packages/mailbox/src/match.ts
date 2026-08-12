import { titlesLookSimilar } from "@jobjitsu/applications";
import type { Application } from "@jobjitsu/applications";
import { emailDomain, isAtsOrBoardDomain, registrableDomain } from "./domains.js";
import type { ApplicationMatchResult, MailboxEmail } from "./types.js";

export const MATCH_WEIGHTS = {
  threadId: 100,
  requisitionId: 100,
  companyDomain: 40,
  companyName: 35,
  recruiterEmail: 30,
  jobTitle: 30,
  similarTitle: 15,
} as const;

const AUTO_LINK_SCORE = 70;

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function companyNameOf(application: Application): string {
  return normalize(application.userOverrides?.companyName ?? application.companyName);
}

function roleTitleOf(application: Application): string {
  return normalize(application.userOverrides?.roleTitle ?? application.roleTitle);
}

/**
 * Deterministic matching — thread / requisition first; never merge on recruiter alone.
 */
export function scoreApplicationMatch(
  email: Pick<
    MailboxEmail,
    "threadId" | "senderEmail" | "company" | "jobTitle" | "recruiterEmail" | "subject"
  >,
  application: Application,
): ApplicationMatchResult {
  if (application.archived || application.mergedIntoId) {
    return { score: 0, uncertain: true, reasons: ["archived"] };
  }

  let score = 0;
  const reasons: string[] = [];
  const senderDomain = registrableDomain(emailDomain(email.senderEmail));
  const appDomain = normalize(
    application.userOverrides?.companyDomain ?? application.companyDomain,
  );
  const emailCompany = normalize(email.company);
  const appCompany = companyNameOf(application);
  const emailTitle = normalize(email.jobTitle);
  const appTitle = roleTitleOf(application);

  if (email.threadId && application.linkedThreadIds?.includes(email.threadId)) {
    score += MATCH_WEIGHTS.threadId;
    reasons.push("thread");
  }

  if (
    application.requisitionId &&
    (email.subject.includes(application.requisitionId) ||
      email.jobTitle?.includes(application.requisitionId))
  ) {
    score += MATCH_WEIGHTS.requisitionId;
    reasons.push("requisition");
  }

  if (
    appDomain &&
    senderDomain &&
    appDomain === senderDomain &&
    !isAtsOrBoardDomain(senderDomain)
  ) {
    score += MATCH_WEIGHTS.companyDomain;
    reasons.push("company-domain");
  }

  if (emailCompany && appCompany && emailCompany === appCompany) {
    score += MATCH_WEIGHTS.companyName;
    reasons.push("company-name");
  }

  if (
    email.recruiterEmail &&
    application.recruiterEmail &&
    email.recruiterEmail === application.recruiterEmail
  ) {
    score += MATCH_WEIGHTS.recruiterEmail;
    reasons.push("recruiter");
  }

  if (emailTitle && appTitle && emailTitle === appTitle) {
    score += MATCH_WEIGHTS.jobTitle;
    reasons.push("title-exact");
  } else if (emailTitle && appTitle && titlesLookSimilar(emailTitle, appTitle)) {
    score += MATCH_WEIGHTS.similarTitle;
    reasons.push("title-similar");
  }

  const sameCompany = Boolean(
    (emailCompany && appCompany && emailCompany === appCompany) ||
    (appDomain && senderDomain && appDomain === senderDomain && !isAtsOrBoardDomain(senderDomain)),
  );
  const differentRole =
    Boolean(emailTitle && appTitle) &&
    emailTitle !== appTitle &&
    !titlesLookSimilar(emailTitle, appTitle);

  if (sameCompany && differentRole) {
    return {
      score: Math.min(score, 40),
      uncertain: true,
      reasons: [...reasons, "same-company-different-role"],
    };
  }

  const recruiterOnly = reasons.length === 1 && reasons[0] === "recruiter";
  if (recruiterOnly) {
    return {
      score: Math.min(score, 30),
      uncertain: true,
      reasons: [...reasons, "recruiter-alone"],
    };
  }

  const uncertain = score < AUTO_LINK_SCORE;
  return {
    applicationId: uncertain ? undefined : application.id,
    score,
    uncertain,
    reasons,
  };
}

export function pickBestMatch(
  email: MailboxEmail,
  applications: readonly Application[],
): ApplicationMatchResult {
  let best: ApplicationMatchResult = { score: 0, uncertain: true, reasons: [] };
  for (const application of applications) {
    const result = scoreApplicationMatch(email, application);
    if (result.score > best.score) {
      best = result;
    }
  }
  return best;
}
