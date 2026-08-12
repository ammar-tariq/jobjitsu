import type {
  AiPromptRole,
  ContextAssembler,
  ContextAssemblerInput,
  KnowledgeReader,
} from "./provider.js";

/** Default slice order for apply-craft (AI_ARCHITECTURE). */
export const CONTEXT_SLICE_ORDER = [
  "profile",
  "resume",
  "projects",
  "achievements",
  "currentJob",
  "roleDescription",
  "tonePreferences",
  "draftExcerpt",
  "knowledge",
  "priorSendMeta",
] as const;

export type ContextSliceKey = (typeof CONTEXT_SLICE_ORDER)[number];

/** Fields the Context Builder may copy from input — never Timeline. */
export const CONTEXT_INPUT_ALLOWLIST = [
  "role",
  "profileExcerpt",
  "resumeExcerpts",
  "projectsExcerpt",
  "achievementsExcerpt",
  "currentJobExcerpt",
  "roleDescription",
  "tonePreferences",
  "draftExcerpt",
  "priorSendMeta",
] as const;

const DEFAULT_BUDGET_CHARS: Record<AiPromptRole, number> = {
  tailor: 4000,
  cover_letter: 3000,
  match_explain: 2000,
  follow_up_draft: 1500,
  parse_assist: 3000,
  email_classify: 1500,
  generic: 2000,
};

export type ContextAssemblerOptions = {
  /** Max characters of assembled prompt body (role line excluded). */
  readonly budgetCharsByRole?: Partial<Record<AiPromptRole, number>>;
  /** Optional Knowledge Base port — no-op until PE14. */
  readonly knowledgeReader?: KnowledgeReader;
};

export function createNoopKnowledgeReader(): KnowledgeReader {
  return {
    read() {
      return [];
    },
  };
}

type SliceLine = {
  readonly key: ContextSliceKey;
  readonly line: string;
};

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  if (maxChars <= 1) {
    return text.slice(0, maxChars);
  }
  return `${text.slice(0, maxChars - 1)}…`;
}

function collectInputSlices(input: ContextAssemblerInput): SliceLine[] {
  const slices: SliceLine[] = [];
  if (input.profileExcerpt?.trim()) {
    slices.push({ key: "profile", line: `profile=${input.profileExcerpt.trim()}` });
  }
  if (input.resumeExcerpts?.length) {
    const resume = input.resumeExcerpts
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" | ");
    if (resume) {
      slices.push({ key: "resume", line: `resume=${resume}` });
    }
  }
  if (input.projectsExcerpt?.trim()) {
    slices.push({ key: "projects", line: `projects=${input.projectsExcerpt.trim()}` });
  }
  if (input.achievementsExcerpt?.trim()) {
    slices.push({ key: "achievements", line: `achievements=${input.achievementsExcerpt.trim()}` });
  }
  if (input.currentJobExcerpt?.trim()) {
    slices.push({ key: "currentJob", line: `currentJob=${input.currentJobExcerpt.trim()}` });
  }
  if (input.roleDescription?.trim()) {
    slices.push({ key: "roleDescription", line: `listing=${input.roleDescription.trim()}` });
  }
  if (input.tonePreferences?.trim()) {
    slices.push({ key: "tonePreferences", line: `tone=${input.tonePreferences.trim()}` });
  }
  if (input.draftExcerpt?.trim()) {
    slices.push({ key: "draftExcerpt", line: `draft=${input.draftExcerpt.trim()}` });
  }
  if (input.priorSendMeta?.trim()) {
    slices.push({ key: "priorSendMeta", line: `prior=${input.priorSendMeta.trim()}` });
  }
  return slices;
}

/**
 * Context Builder — allowlisted slices only, budgeted by task role.
 * Does not dump Timeline. KnowledgeReader may be a no-op until PE14.
 */
export function createContextAssembler(options: ContextAssemblerOptions = {}): ContextAssembler {
  const knowledgeReader = options.knowledgeReader ?? createNoopKnowledgeReader();
  const budgets = { ...DEFAULT_BUDGET_CHARS, ...options.budgetCharsByRole };

  return {
    assemble(input: ContextAssemblerInput): string {
      const budget = budgets[input.role];
      const byKey = new Map<ContextSliceKey, string>();

      for (const slice of collectInputSlices(input)) {
        byKey.set(slice.key, slice.line);
      }

      const knowledgeBudget = Math.max(0, Math.floor(budget / 4));
      const knowledgeParts = knowledgeReader
        .read({ role: input.role, budgetChars: knowledgeBudget })
        .map((entry) => entry.text.trim())
        .filter(Boolean);
      if (knowledgeParts.length > 0) {
        byKey.set("knowledge", `knowledge=${knowledgeParts.join(" | ")}`);
      }

      const ordered = CONTEXT_SLICE_ORDER.map((key) => byKey.get(key)).filter(
        (line): line is string => Boolean(line),
      );

      const header = `role=${input.role}`;
      let remaining = budget;
      const body: string[] = [];

      for (const line of ordered) {
        if (remaining <= 0) {
          break;
        }
        const separator = body.length > 0 ? 1 : 0;
        const room = remaining - separator;
        if (room <= 0) {
          break;
        }
        const clipped = truncate(line, room);
        body.push(clipped);
        remaining -= separator + clipped.length;
      }

      return [header, ...body].join("\n");
    },
  };
}
