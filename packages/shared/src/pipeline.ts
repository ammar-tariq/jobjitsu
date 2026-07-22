/**
 * Pipeline stages for the Application Dojo.
 * Lives in shared so events can reference stages without depending on core.
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

export function isPipelineStage(value: string): value is PipelineStage {
  return (PIPELINE_STAGES as readonly string[]).includes(value);
}
