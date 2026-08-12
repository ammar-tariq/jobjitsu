/**
 * ATS / job-board sender domains — company is in the body, not the From domain.
 */
export const ATS_AND_BOARD_DOMAINS = [
  "greenhouse.io",
  "mail.greenhouse.io",
  "lever.co",
  "hire.lever.co",
  "myworkday.com",
  "workday.com",
  "ashbyhq.com",
  "linkedin.com",
  "linkedinmail.com",
  "indeed.com",
  "smartrecruiters.com",
  "icims.com",
  "jobvite.com",
  "taleo.net",
  "successfactors.com",
  "brassring.com",
  "hackerrank.com",
  "codility.com",
  "codesignal.com",
  "hirevue.com",
] as const;

export function emailDomain(address: string): string {
  const at = address.lastIndexOf("@");
  return at >= 0 ? address.slice(at + 1).toLowerCase() : "";
}

export function registrableDomain(domain: string): string {
  const parts = domain.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) {
    return domain.toLowerCase();
  }
  return parts.slice(-2).join(".");
}

export function isAtsOrBoardDomain(domain: string): boolean {
  const lower = domain.toLowerCase();
  return ATS_AND_BOARD_DOMAINS.some((ats) => lower === ats || lower.endsWith(`.${ats}`));
}

export function companyFromDomain(domain: string): string | undefined {
  if (!domain || isAtsOrBoardDomain(domain)) {
    return undefined;
  }
  const base = registrableDomain(domain).split(".")[0];
  if (!base || base === "gmail" || base === "outlook" || base === "hotmail" || base === "yahoo") {
    return undefined;
  }
  return base.charAt(0).toUpperCase() + base.slice(1);
}
