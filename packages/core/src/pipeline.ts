/**
 * Pipeline stages for the Application Dojo.
 * @see docs/architecture/OVERVIEW.md
 */
export const PIPELINE_STAGES = [
  "discover",
  "curate",
  "tailor",
  "queue",
  "approve",
  "send",
  "follow_up",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
