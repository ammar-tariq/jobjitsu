# Epics

| ID | Epic | Horizon | Outcome |
|----|------|---------|---------|
| [E01](#e01-platform-foundation) | Platform Foundation | H1 | Runnable Tauri+React monorepo with design tokens |
| [E02](#e02-storage--event-spine) | Storage & Event Spine | H1 | On-device DB + typed local event bus |
| [E03](#e03-desktop-shell--ipc) | Desktop Shell & IPC | H1 | Host/UI split, deny-by-default bridge, nav chrome |
| [E04](#e04-identity--resume) | Identity & Resume | H1 | Local profile/résumé source of truth |
| [E05](#e05-preferences--privacy-chrome) | Preferences & Privacy Chrome | H1 | Approval gates + honest Agent · On-device pill |
| [E06](#e06-local-intelligence) | Local Intelligence | H1 | Local LLM provider + context assembler |
| [E07](#e07-discovery--curation) | Discovery & Curation | H1 | Fit-first role intake (local/file source first) |
| [E08](#e08-applications) | Applications | H1 | Draft, tailor, version, track throws |
| [E09](#e09-queue--review) | Queue & Review | H1 | Approval ritual before egress |
| [E10](#e10-send-egress-boundary) | Send (Egress Boundary) | H1 | Sole career-data outbound path |
| [E11](#e11-follow-ups--scheduler) | Follow-ups & Scheduler | H1 | Polite nudges, local jobs, quiet hours |
| [E12](#e12-agent) | Agent | H1 | Preparative orchestration; pause; never sends |
| [E13](#e13-timeline--trust) | Timeline & Trust | H1 | What left / what stayed; inspectable logs |
| [E14](#e14-onboarding--empty-states) | Onboarding & Empty States | H1 | Zero-friction first run; calm empties |
| [E15](#e15-outcomes--reflection) | Outcomes & Reflection | H2 | Craft feedback without guilt |
| [E16](#e16-timeline-depth) | Timeline Depth | H2 | Richer hunt memory |
| [E17](#e17-career-craft-modules) | Career Craft Modules | H3 | Interview / narrative / fit rooms |
| [E18](#e18-plugin-system) | Plugin System | H4 | Capability-gated agent skills |
| [E19](#e19-extension-system--portability) | Extensions & Portability | H4 | Host contributions + export |

---

## E01 Platform Foundation

Stand up pnpm monorepo, Tauri app shell, React UI package, and design-token plumbing so later work has a place to land. **No career data egress.**

## E02 Storage & Event Spine

Deliver `packages/storage` and `packages/events` with on-device persistence and typed in-process bus + durable subset hooks.

## E03 Desktop Shell & IPC

Wire host↔UI narrow IPC, primary navigation (Applications, Queue, Follow-ups, Agent, Preferences), dark theme default, status bar region.

## E04 Identity & Resume

Import/store résumé and profile locally; readable by AI/applications; never implied cloud sync.

## E05 Preferences & Privacy Chrome

Fit rules, approval-before-send default on, quiet hours, model path prefs; always-visible Agent · On-device pill with honest states.

## E06 Local Intelligence

Provider interface, fake + local adapter path, context assembler, health events for badge; no silent cloud fallback.

## E07 Discovery & Curation

Source interface + first local/manual/CSV (or fixture) source; curation toward fit; no infinite feed product.

## E08 Applications

Application entity lifecycle: create draft, edit, tailor via AI, list/track status.

## E09 Queue & Review

Enqueue for review; approve/reject; enforce preferences; emit queue events.

## E10 Send (Egress Boundary)

Only package that may transmit career payloads; file-export and/or mailto/stub channel first; honest success/fail/unknown; timeline audit.

## E11 Follow-ups & Scheduler

Schedule polite follow-ups; local scheduler; due notifications (calm); no auto-send without policy.

## E12 Agent

Preparative planner using discovery/AI/applications/queue; start/pause/resume; idle microcopy; cannot call send.

## E13 Timeline & Trust

Append-only local timeline for approvals, egress, agent pause; sanitized logs view.

## E14 Onboarding & Empty States

Three-beat onboarding; brand empty states; copy from brand guidelines.

## E15 Outcomes & Reflection (H2)

Record outcomes; reflect without shame metrics.

## E16 Timeline Depth (H2)

Notes, richer filters, export-ready history views.

## E17 Career Craft Modules (H3)

Interview readiness, narrative studio, role-fit — admitted per module test.

## E18 Plugin System (H4)

Manifest, capabilities, enable/disable, one official sample skill.

## E19 Extensions & Portability (H4)

Contribution points + user-triggered data export.
