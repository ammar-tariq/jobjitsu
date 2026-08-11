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
