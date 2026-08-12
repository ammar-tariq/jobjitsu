import type { Application, ApplicationDraftInput, DuplicateWarning } from "./types.js";

function normalizeKeyPart(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Soft-duplicate identity key — DATA_MODELS. */
export function applicationDuplicateKey(input: {
  readonly companyName: string;
  readonly roleTitle: string;
  readonly sourceUrl?: string;
  readonly requisitionId?: string;
}): string {
  return [
    normalizeKeyPart(input.companyName),
    normalizeKeyPart(input.roleTitle),
    normalizeKeyPart(input.sourceUrl),
    normalizeKeyPart(input.requisitionId),
  ].join("|");
}

export function findDuplicateWarning(
  existing: readonly Application[],
  candidate: Pick<
    ApplicationDraftInput,
    "companyName" | "roleTitle" | "sourceUrl" | "requisitionId"
  >,
  options: { readonly excludeId?: string } = {},
): DuplicateWarning | undefined {
  const key = applicationDuplicateKey(candidate);
  if (!normalizeKeyPart(candidate.companyName) || !normalizeKeyPart(candidate.roleTitle)) {
    return undefined;
  }
  const match = existing.find((app) => {
    if (options.excludeId && app.id === options.excludeId) {
      return false;
    }
    return applicationDuplicateKey(app) === key;
  });
  if (!match) {
    return undefined;
  }
  return {
    matchedApplicationId: match.id,
    message:
      "A similar application draft already exists for this company and role. You can still save this one.",
  };
}

function canonicalizeTitle(value: string): string {
  return normalizeKeyPart(value)
    .replace(/\bdeveloper\b/g, "engineer")
    .replace(/\bsoftware\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Near-duplicate titles (engineer/developer) for email-sourced grouping hints. */
export function titlesLookSimilar(left: string, right: string): boolean {
  const a = canonicalizeTitle(left);
  const b = canonicalizeTitle(right);
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  return a.includes(b) || b.includes(a);
}

export function findPossibleDuplicateApplications(
  existing: readonly Application[],
  candidate: Pick<Application, "companyName" | "roleTitle" | "id">,
): readonly Application[] {
  const company = normalizeKeyPart(candidate.companyName);
  if (!company) {
    return [];
  }
  return existing.filter((app) => {
    if (app.id === candidate.id || app.archived || app.mergedIntoId) {
      return false;
    }
    return (
      normalizeKeyPart(app.companyName) === company &&
      titlesLookSimilar(app.roleTitle, candidate.roleTitle)
    );
  });
}
