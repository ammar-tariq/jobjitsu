# Data Models (conceptual)

> Field-level ownership for Core entities. Not a SQL dump — enough to implement without inventing identity rules.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Storage ADR: [../adr/0006-storage.md](../adr/0006-storage.md) · Terms: [../product/TERMINOLOGY.md](../product/TERMINOLOGY.md)

IDs are opaque branded strings (`ProfileId`, `ResumeId`, `ApplicationId`, …) living in `packages/shared` when coded.

---

## Ownership

| Entity | Write owner | Read by |
|--------|-------------|---------|
| Profile | `identity` | agent, ai (Context Builder), applications |
| Path (career face under Profile) | `identity` | applications, agent (selection local-only) |
| ResumeVersion / Resume Library | `identity` | agent, ai, applications |
| KnowledgeEntry (Achievement, Story, STAR, Note) | `identity` (Knowledge Base surface) or future `knowledge` package — **default: identity** until split | Context Builder, agent |
| Application | `applications` | queue, send, timeline, followups |
| QueueItem | `queue` | send, ui |
| FollowUp | `followups` | scheduler, send |
| TimelineEvent | `timeline` | ui (trust) |
| PreferenceDocument | `config` (SSOT store); `preferences` package is the façade API | agent, queue policy |

| DiscoveryRole | `discovery` | applications, agent |

Knowledge Base **must not** duplicate Timeline (audit) rows as knowledge facts.

---

## Profile

Required: `id`, `displayName`, `updatedAt`  
Optional (from platform spec): contact, links, location, workAuthorization notes, salary expectations (sensitive — local only), skills summary refs.

## Path

Career face under one Profile (UI: **Path** — e.g. Fullstack Developer, Mobile App). Not a second identity.

Required: `id`, `profileId`, `name`, `archived`, `updatedAt`  
Optional: `notes`, `selectedResumeVersionId` (wired when import attach / PE03-S07 lands)

Selection of the active path is local-only and must never Send.

## ResumeVersion

Required: `id`, `profileId`, `label`, `createdAt`, `format` (structured | document blob ref)  
Optional: `parentVersionId`, `tailorApplicationId`, `atsNotes`

## KnowledgeEntry

Required: `id`, `profileId`, `kind` (`achievement` | `story` | `star` | `project` | `note`), `title`, `body`, `updatedAt`  
Optional: `technologies[]`, `metrics[]`, `sourceResumeId`

## Application

Required: `id`, `stage` (see [Application Pipeline](#application-pipeline-stages)), `createdAt`, `updatedAt`  
Optional: `roleId`, `companyName`, `resumeVersionId`, `coverLetterRef`, `confirmation`, `notes`

## QueueItem

Required: `id`, `applicationId`, `state` (`enqueued` | `approved` | `rejected` | `cleared`), `createdAt`

## EgressRecord

Required: `attemptId`, `applicationId` (or followUpId), `destinationClass` (`board` | `mail` | `file_export`), `status` (`success` | `failed` | `unknown`), `startedAt`, `finishedAt`  
Optional: `channelId`, `errorCode` (no résumé bodies)

Written via `Privacy.EgressRecorded` / Send.* handlers into Timeline storage.

## TimelineEvent

Required: `id`, `at`, `eventName` (catalog name), `refs` (ids only)  
Optional: `summary` (coarse, non-PII)  
Must not store full résumé/cover letter bodies.

## WorkflowRun (Experimental)

Required: `id`, `workflowId`, `status` (`running` | `waiting` | `completed` | `failed` | `cancelled`), `startedAt`  
Optional: `currentStepId`, `applicationId`

## AiTask (Experimental)

Required: `id`, `runId`, `state` (`Pending` | `Running` | `Waiting` | `Completed` | `Failed` | `Cancelled`), `label`  
Optional: `progress` (0–1), `role`

Task state is available via `agent.getTaskQueueSnapshot`. Bus emits coarse `Ai.Started` / `Ai.Finished` / `Workflow.*` — not per-state spam.

## Application Pipeline stages

Two vocabularies — **map, do not merge blindly**:

| Prep / egress (`PIPELINE_STAGES` / Agent progress) | Tracking status (platform Application Pipeline) |
|----------------------------------------------------|--------------------------------------------------|
| `discover` | `Discovered` |
| `curate` | (filtering; may stay Discovered) |
| `tailor` | `ResumePrepared` / `CoverLetterPrepared` |
| `queue` | `ReadyForReview` |
| `approve` | `Approved` (local) |
| `send` | `Submitted` |
| `follow_up` | `FollowUpSent` / later interview stages |

Post-send tracking (`RecruiterResponded` → `Archived`) is **applications** domain status, not prep-pipeline stages. Document both in UI as Application detail; emit `Application.StageChanged` when tracking status changes.

---

## Duplicate detection (applications)

Key fields: normalized company + role title + source URL (when present) + optional requisition id. Soft-warn; user may proceed.
