# User Stories & Acceptance Criteria

Format: **Story** then **Acceptance Criteria (AC)**. Tasks: [TECHNICAL_TASKS.md](./TECHNICAL_TASKS.md).

---

# E01 Platform Foundation

### E01-F01-S01 — As a developer, I can install and typecheck the monorepo
**AC**
- Given a clean clone, when I run the documented install, packages link via pnpm workspaces.
- `packages/core` (or equivalent stub) typechecks.
- README documents the install command.
- No network calls that upload user data exist in scaffolding.

### E01-F02-S01 — As a developer, I can open an empty Tauri window
**AC**
- `app` builds and launches a window on the primary supported OS in CI/dev docs.
- Window title is `JobJitsu`.
- No Electron dependency introduced.

### E01-F03-S01 — As a developer, I see a React root inside the shell
**AC**
- Webview renders a React “JobJitsu” placeholder using Inter if available.
- TS strict mode enabled for `app/ui`.
- Hot reload path documented (dev only).

### E01-F04-S01 — As a developer, dark theme tokens apply to the shell background
**AC**
- Canvas uses Midnight Ink semantic token.
- Token CSS (or TS theme module) lives in `packages/ui` (or `packages/tokens`).
- Light theme tokens exist but dark is default.

---

# E02 Storage & Event Spine

### E02-F01-S01 — As the host, I can persist a key-value/document row locally
**AC**
- Storage writes under the app user-data directory.
- Restart preserves data.
- Unit test uses temp directory; no cloud endpoint.

### E02-F02-S01 — As a developer, I have typed event names for core domains
**AC**
- Events include Agent.*, Queue.*, Send.*, Ai.*, FollowUp.*, Privacy.* stubs per architecture catalog.
- Payloads typed without requiring résumé bodies on Progress events.

### E02-F03-S01 — As a package, I can publish and subscribe to events in-process
**AC**
- Subscriber receives matching events in order for a single publisher test.
- Bus does not perform network I/O.

**Status:** Done (`createInMemoryEventBus` in `@jobjitsu/events`)


### E02-F04-S01 — As timeline (later), I can hook durable persistence for a subset
**AC**
- Interface/callback exists for “durable events.”
- Default no-op implementation; test verifies invocation for Send.Attempted sample.

---

# E03 Desktop Shell & IPC

### E03-F01-S01 — As the UI, I can call only allowlisted host commands
**AC**
- Documented ping/health command succeeds.
- Arbitrary/unknown command fails closed.
- Test covers deny path.

### E03-F02-S01 — As a user, I can navigate primary sections
**AC**
- Nav labels: Applications, Queue, Follow-ups, Agent, Preferences (sentence case nouns).
- One main view visible at a time.
- Status region reserved at bottom/chrome.

### E03-F03-S01 — As a user, I can switch light/dark theme
**AC**
- Default dark on first launch.
- Preference persists locally.
- Contrast remains AA for primary text both themes.

### E03-F04-S01 — As a developer, I can use JjButton and JjBadge
**AC**
- Primary/secondary/ghost variants exist.
- Components use semantic tokens, not raw hex in call sites.

---

# E04 Identity & Resume

### E04-F01-S01 — As a user, I can import a résumé from disk
**AC**
- File picker selects local file only.
- File stored on-device; UI confirms “Stored on this device.”
- No upload toast or cloud wording.

### E04-F02-S01 — As a user, I can edit basic profile fields
**AC**
- Name and contact fields save locally.
- Reload shows saved values.

### E04-F03-S01 — As AI/applications packages, I can read identity safely
**AC**
- Read API returns structured data.
- No method on identity package performs egress.

---

# E05 Preferences & Privacy Chrome

### E05-F01-S01 — As a user, my preferences persist across restarts
**AC**
- Changing a pref + restart restores it.

### E05-F02-S01 — As a user, approval-before-send defaults on
**AC**
- Fresh profile has require-approval enabled.
- Quiet hours fields exist (even if unused until scheduler).

### E05-F03-S01 — As a user, I always see Agent · On-device status
**AC**
- Pill visible on main chrome (`JjAgentPrivacyPill`).
- States: unavailable / loading / ready (and remote label if configured later).
- Ready does not claim on-device when provider is remote.

### E05-F04-S01 — As a user, I can edit preferences in a calm settings view
**AC**
- Copy is sentence case, no FOMO.
- Toggle labels describe enabled state.

---

# E06 Local Intelligence

### E06-F01-S01 — As the system, I talk to models via a provider interface
**AC**
- Interface exposes health + complete.
- No default cloud base URL in config.

### E06-F02-S01 — As a developer, I can run AI flows with a fake provider
**AC**
- Fake returns deterministic text.
- Used in unit tests without network.

### E06-F03-S01 — As a user, I can set a local model path preference
**AC**
- Pref stores path string.
- Invalid path → health unavailable + plain error (no metaphor).

### E06-F04-S01 — As tailor flow, context excludes unnecessary PII volume
**AC**
- Assembler includes résumé excerpts + role + prefs tone only as designed.
- Unit test asserts full unrelated timeline not included.

### E06-F05-S01 — As Agent · On-device chrome, I reflect AI health events
**AC**
- Loading/ready/failed events update the privacy pill within one UI tick subscription path.
- Copy matches brand loading line when loading (optional microcopy).

---

# E07 Discovery & Curation

### E07-F01-S01 — As an extension (later), I implement a discovery source
**AC**
- Interface: fetch candidates → normalized role shape.
- Built-in registration path for first-party sources.

### E07-F02-S01 — As a user, I can import roles from a local CSV/fixture
**AC**
- Import creates local role records.
- No remote job-board scraping required for H1 MVP path.

### E07-F03-S01 — As a user, curation respects fit preferences
**AC**
- Filter reduces set using prefs keywords/constraints.
- Empty filter result shows calm empty state (not shame).

### E07-F04-S01 — As a user, I can browse curated roles
**AC**
- List shows title/company.
- Selecting a role can start an application draft (wired in E08 or stub CTA).

---

# E08 Applications

### E08-F01-S01 — As a user, I can create and edit an application draft
**AC**
- Draft persists locally with status `draft`.
- Delete draft requires explicit confirm copy.

### E08-F02-S01 — As a user, I can tailor a draft with local AI
**AC**
- Tailor uses provider + context assembler.
- Result is editable; user remains author.
- Does not send anywhere.

### E08-F03-S01 — As a user, I can list applications and open detail
**AC**
- List shows status.
- Detail shows draft body + meta.

---

# E09 Queue & Review

### E09-F01-S01 — As the agent/user, I can enqueue an application for review
**AC**
- Status becomes queued.
- Queue.Enqueued emitted.

### E09-F02-S01 — As a user with approval required, send is blocked until approve
**AC**
- Approve transitions to approved-for-send.
- Reject returns to draft/queued policy as specified.
- Without approve, send service refuses (contract with E10).

### E09-F03-S01 — As a user, I review queue items calmly
**AC**
- Queue UI lists items needing review.
- Primary actions: Approve send / Reject.
- No urgency countdown.

---

# E10 Send (Egress Boundary)

### E10-F01-S01 — As the system, only send package performs career egress
**AC**
- Architecture/test fence: agent dependency must not import send execute.
- Send API is the sole documented egress.

### E10-F02-S01 — As a user, I can complete send via a safe first channel
**AC**
- H1 channel: local file export of application package and/or mailto stub — documented.
- User explicitly triggers send after approval.

### E10-F03-S01 — As a user, I see honest send outcomes
**AC**
- Success → quiet success toast (“Application sent” / throw microcopy allowed).
- Failure → plain recovery error.
- Unknown → not shown as success; copy per error guidelines.

### E10-F04-S01 — As trust chrome, egress is audited
**AC**
- Privacy.EgressRecorded (or timeline write) includes destination class + application id + timestamp.
- Résumé body not required in event payload.

---

# E11 Follow-ups & Scheduler

### E11-F01-S01 — As a user, I can schedule a follow-up after send
**AC**
- Follow-up linked to application.
- Appears in Follow-ups list as scheduled.

### E11-F02-S01 — As the system, due jobs fire locally after restart
**AC**
- Scheduler persists jobs.
- Time-travel test marks due.

### E11-F03-S01 — As a user, I get a polite due reminder
**AC**
- Caution tone, not error red.
- Copy aligns with “gently nudge.”
- No sound by default.

### E11-F04-S01 — As a user, I can dismiss or send follow-up under policy
**AC**
- Dismiss removes/snoozes per design.
- Send follow-up goes through send + approval rules.

---

# E12 Agent

### E12-F01-S01 — As a user, I can start, pause, and resume the agent
**AC**
- Pause leaves queue intact.
- Pause emits Agent.Paused.
- Agent cannot reach send.execute.

### E12-F02-S01 — As a user, the agent prepares drafts into the queue
**AC**
- Given prefs + identity + at least one role, agent run creates/tailors and enqueues ≥1 item in test fixture mode.
- Never auto-sends.

### E12-F03-S01 — As a user, idle agent feels calm
**AC**
- Idle shows readiness (“Your belt is tied…” allowed).
- Progress toasts batch counts, no spam per step.

---

# E13 Timeline & Trust

### E13-F01-S01 — As the system, timeline stores local audit entries
**AC**
- Append-only API.
- Survives restart.

### E13-F02-S01 — As the bus, durable events land in timeline
**AC**
- Send.* and Queue.Approved (and Agent.Paused) create timeline rows.

### E13-F03-S01 — As a user, I can inspect what left / what stayed
**AC**
- Timeline UI lists egress vs local-only actions.
- Logs view shows sanitized lines (no accidental full résumé dump by default).

---

# E14 Onboarding & Empty States

### E14-F01-S01 — As a new user, I complete a three-beat first run
**AC**
- Steps: Connect resume → Set preferences → Agent ready.
- Can skip non-critical steps with clear consequences.
- Ends on calm home with pill visible.

### E14-F02-S01 — As a user, empty surfaces invite without shame
**AC**
- Applications/Queue/Follow-ups empty states match brand docs.
- One primary CTA each.

---

# E15–E19 (summary stories)

### E15-F01-S01 — Capture outcomes on applications without guilt UX
**AC:** Outcome enum + note; no “you’re behind” prompts.

### E15-F02-S01 — View calm reflection summary
**AC:** Aggregates local counts; no streaks/leaderboards.

### E16-F01-S01 — Add notes to timeline/application
**AC:** Local-only notes persist.

### E16-F02-S01 — Filter timeline by type
**AC:** Filter egress vs agent vs approvals.

### E17-F01-S01 — Open interview readiness shell module
**AC:** On-device; no guaranteed-offer copy; admitted via module test.

### E17-F02-S01 — Narrative studio shell
**AC:** Drafts local; user owns voice.

### E17-F03-S01 — Role-fit compass shell
**AC:** Guidance language only.

### E18-F01-S01 — Define plugin manifest schema
**AC:** Capabilities listed; invalid manifest refuses load.

### E18-F02-S01 — Enable/disable plugin fail-closed
**AC:** Disabled plugins do not run; missing caps denied.

### E18-F03-S01 — Ship one official sample skill
**AC:** Inspectable; preparative only; no send.

### E19-F01-S01 — Register a discovery contribution point
**AC:** Extension SDK stub + host registration.

### E19-F02-S01 — Export my data on demand
**AC:** User-triggered archive; no ambient cloud sync.
