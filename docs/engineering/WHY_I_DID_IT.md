# Why I did it

Living decision log for JobJitsu engineering choices. Newest entries first.
Written so a human can see **the problem**, **the options**, **what we chose**, **libraries**, and **how it was built**.

---

## 2026-08-11 — Craft export failed: missing save-dialog permission (+ PDF bytes)

### The problem

“Could not export that draft. Try again.” on Save PDF / Save HTML in the desktop app. The file saver calls the dialog plugin’s `save()`, but our capability only granted `dialog:allow-open` — the save dialog itself was denied and threw before anything was written.

### Decision

1. Grant **`dialog:allow-save`** in `capabilities/default.json`. Tauri 2 automatically adds the user-picked path to the fs scope for that session, so deny-by-default holds: writes go only where the user explicitly chose. Launch-smoke asserts the permission.
2. Fixed a latent PDF corruption in the same path: `/Length` and xref offsets were computed from UTF-16 string lengths but the file was UTF-8-encoded — any non-ASCII draft (“Résumé”, em dashes) produced a broken xref. The generator now sanitizes to Latin-1 (typographic chars → ASCII, others → `?`) and encodes 1 char = 1 byte, so offsets are exact and é renders correctly in Helvetica.

No new libraries.

---

## 2026-08-11 — Craft full audit: undefined-key patch wipe (real root cause)

### The problem

Résumé ↔ JD still wiped each other after the first paste-race fix. Full read of the Craft path found the actual bug **in the host, not the view**: the `craft.patchSession` IPC handler always builds the patch with every key present (`resumeText: payload.resumeText, …`), so a one-field patch arrives as `{ resumeText: undefined, jobDescription: "…" }`. The store then spread `{ ...prev, ...patch }` — and spreading an explicit `undefined` **overwrites** the stored value. The earlier UI fix only masked it when both edits landed inside one 200 ms debounce window.

### Decision

1. **Store patch is field-by-field** (`patch.x ?? prev.x`) so absent keys can never erase state. Fixed at the SSOT, not per-caller.
2. **Patch responses are no longer applied to view state.** The host emits every change through `HostProvider` in order; replaying responses could land out of order and clobber newer state. Pending local edits still win during merge.
3. **Unmount flushes (not drops) the pending debounce patch** so the last keystrokes survive navigating away.
4. **⌘/Ctrl+Enter chat send now respects busy** — the keyboard path bypassed the disabled button and could fire concurrent refines.
5. Removed the unreachable hidden status block (dead since the working view early-return).

### Tests

- Store: a patch shaped like the IPC payload (undefined keys) keeps stored fields.
- Shell: two pastes flushed as **separate** patches keep both résumé and JD.

No new libraries.

---

## 2026-08-11 — Craft working view (inputs + phases + CPU/RAM)

### The problem

Prepare still felt opaque: a thin progress alert on top of the form. Users needed to see **what was pasted**, **which phase Agent is in**, and preferably **device load** (CPU / memory) while a local model runs.

### Options considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Bigger Alert + checklist only | Cheap | Still no input review; no load | Rejected |
| Fake % progress bar | Familiar | Lies about Ollama wall time | Rejected |
| **Dedicated Craft working view + sysinfo** | Clear SSOT UI; honest machine meters | Native + IPC surface | **Chosen** |
| Electron/`os` from renderer | Easy in browser | Wrong stack; breaks Tauri deny-by-default | Rejected |

### Decision

While `job.status === "running"`, Craft swaps to **`CraftWorkingView`**:

1. **Inputs** — truncated résumé / JD / about with character counts (read-only mirror of host session).
2. **Phases** — checking → résumé → cover (by kind), with Now / Done / Next.
3. **Elapsed seconds** + calm “usually under a minute” copy (no fake ETA %).
4. **This device** — processor % and memory used/total via host IPC.

Leaving Craft still keeps the host job alive (prior decision); shell banner unchanged.

### Libraries / packages used (and why)

| Piece | Why |
|-------|-----|
| **`sysinfo` 0.33** (Rust, Tauri command) | Local CPU + RAM only; no network; inspectable crate |
| Existing deny-by-default IPC (`system.getResources`) | Renderer never imports native APIs; ADR 0013 |
| `allow-resource-snapshot` Tauri permission | Explicit capability; launch-smoke asserts it |
| MUI `LinearProgress` determinate meters | Already in shell; calm bars, not dashboard widgets |
| Browser fallback in `resource-snapshot.ts` | Vitest / web: JS-heap estimate or clear “open desktop” note |

We did **not** stream Ollama token metrics into the UI — that would push model jargon into the main path and needs a separate Agent advanced surface later.

### How it was built

1. Tauri `get_resource_snapshot` — brief CPU refresh delay (~120ms) so usage is non-zero.
2. Host `readResourceSnapshot` + IPC `system.getResources`.
3. `CraftWorkingView` polls resources ~1.5s while mounted; Craft early-returns this view when preparing.
4. Tests: working view appears with slow fake AI; IPC allowlist; formatBytes; capability smoke.

### Privacy

Resource snapshot never includes résumé/JD text. Career data stays in the craft session; meters are machine load only.

---

## 2026-08-11 — Craft prepare: progress + survive navigation

### The problem

1. Tapping **Prepare drafts** felt dead — no status, no sense that Agent was working, no time guidance.
2. Leaving Craft (switching nav) **destroyed React state**, so the in-flight generate was abandoned and the user returned to empty fields.

### Options considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Keep generate in `CraftView` + spinner only | Fast UI tweak | Still dies on unmount | Rejected |
| `localStorage` for drafts only | Survives remount | Doesn’t keep the AI job alive; racey | Rejected |
| **Host-owned craft session + background prepare** | Matches architecture (UI ≠ AI); job survives nav; progress is one SSOT | More IPC surface | **Chosen** |
| Persist every keystroke to disk | Survives process restart | Overkill for this bug; slower typing path | Deferred |

### Decision

Move Craft **sources, drafts, and prepare job** into the host (`createCraftSessionStore`).

- UI **patches** the session as the user types (debounced).
- **Prepare** starts on the host and returns immediately with `job.status = "running"`.
- Phases update while Ollama/`complete` runs: `checking` → `resume` → `cover_letter` → `ready` / failure.
- Leaving Craft does **not** cancel the job. Returning shows drafts + status.
- If the user is on another screen, shell shows a calm banner: Agent is preparing… **Open Craft**.

### Libraries / packages used (and why)

| Piece | Why |
|-------|-----|
| Existing `@jobjitsu/ai` (`complete`, health) | Already the only legal Agent path; host-owned |
| Existing `@jobjitsu/events` (`Ai.Started` / `Ai.Finished`) | Timeline/Agent activity without new event types |
| MUI `LinearProgress` + `Alert` | Already in the shell; calm indeterminate progress (no fake % clocks) |
| **No new npm deps** | Prefer inspectable in-repo stores over another state library |

We did **not** add React Query / Redux / Zustand: the host is already the composition root; another client store would duplicate SSOT and tempt the UI to own AI again.

### How it was built

1. `app/src/host/craft-session.ts` — in-memory session store with `patch`, `prepareDrafts`, `subscribe`.
2. `craft-generate.ts` — optional `onPhase` callbacks so the store can publish human messages mid-run.
3. `runtime.ts` — creates the store once; exposes `getCraftSession` / `subscribeCraftSession`.
4. IPC allowlist: `craft.getSession`, `craft.patchSession`, `craft.prepareDrafts` (deny-by-default ADR 0013).
5. `HostProvider` — mirrors session into React context for Craft + shell banner.
6. `CraftView` — reads/writes session; shows progress alert + elapsed seconds; does not await generate in a way that dies on unmount.

### Time estimate copy

No honest wall-clock ETA exists for arbitrary local models. Copy uses **phase + “usually under a minute on this device”** plus a live **elapsed seconds** counter — calm, not fake precision.

### Tests

- `craft-session.test.ts` — prepare fills drafts; second prepare while running is ignored.
- Existing PE28 Craft UI tests still drive prepare via the Craft buttons.

---

## 2026-08-11 — Craft UX layout (tabs / collapse sources)

### The problem

Craft was a long single column: two huge paste boxes, drafts, preview, save, chat. Tiring to scroll.

### Decision

Sources collapse after prepare; résumé / cover / preview as **tabs**; refine on demand; one primary **Prepare drafts** action.

### Libraries

MUI `Tabs`, `Collapse`, `ToggleButtonGroup` — already used in the app; no new design system.

---

## 2026-08-11 — Sellable local MVP (durable apps, queue, honest startup)

### The problem

App looked like a career OS but applications were memory-only, Queue/Follow-ups/Timeline were Coming Soon, and startup faked a mailbox send.

### Decision

Thin vertical product pass: KV applications, real Queue/Follow-ups/Timeline views, approval toggle, onboarding, kill fake send. Documented in `docs/product/SELLABLE_LOCAL_MVP.md`.

### Libraries

Existing `@jobjitsu/storage` KV (same pattern as identity profiles) — no new DB. Ollama remains the local Agent path via `@jobjitsu/ai`.
