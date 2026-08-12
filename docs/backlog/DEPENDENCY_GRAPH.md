# Dependency graph

How the PE epics unlock each other. Per-story status lives on the
[JobJitsu Development board](https://github.com/users/ammar-tariq/projects/2); the story catalog is
[USER_STORIES.md](./USER_STORIES.md). This file is ordering only.

## What unlocks what

- **PE01 Shell** unlocks everything: the window, primary navigation, and the deny-by-default IPC
  boundary every view rides on.
- **PE02 Storage & events** unlocks identity (PE03), preferences (PE04), discovery (PE07), the
  follow-up scheduler (PE11), and the durable timeline (PE12) — all persistence and event flow.
- **PE03 Identity** and **PE04 Preferences** unlock local intelligence (PE05): the Context Builder
  reads profile and preference slices, and approval defaults must exist before anything egresses.
- **PE05 Local intelligence** unlocks craft: tailored résumé drafts (PE03-S04/S10), cover letters
  (PE08-S02), and the Craft Studio (board epic PE28).
- **PE07 Discovery** feeds curated roles into application drafts (PE08). Drafts do not require it —
  a role may be manual — so PE08 shipped first.
- **PE08 Applications** unlocks the review Queue (PE09); PE04's approval policy gates it.
- **PE09 Queue** unlocks **PE10 Send**: the approval policy must exist before egress executes.
- **PE10 Send** unlocks egress audit (PE10-S02 with PE12), post-send tracking (PE08-S03), and
  follow-up send-under-policy (PE11-S04).
- **PE04 quiet hours** (PE04-S02) is enforced by PE11 due notifications.
- **PE08 + PE09** unlock the preparative agent (PE06), which orchestrates drafts into the Queue.
  PE10 is a **fence-only** edge for PE06: tests prove the agent cannot import or execute send.
- **PE03 + PE04 + PE06** shape onboarding (PE13); empty states need only PE01 navigation.

## Waves

1. **Wave 0 — Foundation (shipped):** PE01 shell, then PE02 storage & events.
2. **Wave 1 — Trust surface (shipped):** PE03 identity, paths, résumé library ‖ PE04 preferences
   and privacy chrome.
3. **Wave 2 — Craft (shipped):** PE05 local intelligence through real Ollama models, the Craft
   Studio, and PE08 drafts, cover letters, list/detail.
4. **Wave 3 — Discovery (next):** PE07 provider registry → curation → browse and select into
   application drafts.
5. **Wave 4 — Sovereignty:** PE09 approve/reject with `canSend` policy → PE10 send package host
   path → PE12 durable timeline + egress audit → PE08-S03 post-send tracking.
6. **Wave 5 — Follow-through:** PE11 scheduler arm (persist, due nudges, quiet hours), then
   send-under-policy once PE10 lands.
7. **Wave 6 — Agent:** PE06 start/pause and orchestrate into the Queue — after PE08/PE09, fenced
   from PE10.
8. **Wave 7 — First-run polish:** PE13 onboarding and empty states; PE-QA privacy gates green.

Within a wave, epics can proceed in parallel once their unlocks above are satisfied.

## Hard constraints (never invert)

1. PE09 approval policy lands before PE10 send executes.
2. PE06 agent never gains a dependency on PE10 send — fence tests only.
3. PE10 exists before any "auto apply" idea — and even then, never auto-apply.
4. PE11 nudges never bypass quiet hours (PE04-S02).
5. No Experimental or Future work that violates the product non-goals to "go faster."
