# Sprint 1 — Desktop Foundation

> **Epic:** Desktop Foundation  
> Establish the runnable host: shell, composition root, events, settings, logging, errors, theme, and empty plugin/extension registries.  
> **Still no AI.** No providers, no tailor, no model paths, no “intelligence” product surface.
>
> **IA migration:** PE01-S02 replaced Dojo/Inbox/… with Applications / Queue / Follow-ups / Agent / Preferences / Timeline per [DESKTOP_ARCHITECTURE.md](../architecture/DESKTOP_ARCHITECTURE.md).
>
> **Status vs VERTICAL_SLICES:** Sprint 1 tracks DF-* AC. Completed slices (including later fakes/cascade) are recorded in [VERTICAL_SLICES.md](./VERTICAL_SLICES.md) — that file is the slice ledger; this sprint doc remains the Desktop Foundation commitment.
>
> **Manifesto:** Privacy by default · Local first · Human in control · Calm technology · Quality over quantity  
> **Brand UI:** Agent (not LLM) · On-device · Never pressure · Clean, uncluttered chrome  
> **Process:** One vertical slice at a time ([VERTICAL_SLICES.md](./VERTICAL_SLICES.md) · [AI_DEVELOPMENT_WORKFLOW.md](../../AI_DEVELOPMENT_WORKFLOW.md))

---

## Epic

### Desktop Foundation

Build the desktop application’s **operating skeleton** so later epics (identity, applications, queue, send, agent intelligence) plug into a stable host.

| In Sprint 1 | Explicitly later |
|-------------|------------------|
| Launch desktop app | Identity / résumé product flows |
| Shell layout | Discovery, applications, queue, send |
| Event bus registration in host | AI providers / tailor / embeddings |
| Plugin loader (empty, capability-gated) | Official skills that call AI |
| Dependency injection / composition root | Full product services |
| Settings service | Outcomes, follow-ups product UX |
| Logging | Timeline UI |
| Error reporting (local) | Cloud crash telemetry |
| Theme system | Marketing site |
| Extension manager (empty registry) | Community extensions |

---

## Sprint goal

By the end of Sprint 1, a contributor can:

1. **Launch** the JobJitsu desktop window (Tauri + React).
2. See a **calm shell layout** (nav + main + status) with **Agent · On-device** placeholder chrome (static is OK — no AI health wiring).
3. Boot a **composition root** (DI) that registers core services.
4. Use an **in-process event bus** from the host.
5. Persist **settings** on-device (dark default, approval-before-send default on).
6. **Log** and **report errors** locally (no cloud).
7. Switch **theme** via settings.
8. Have **plugin loader** and **extension manager** stubs that load **zero** plugins/extensions safely (fail closed).

**Still no AI** — no `AiProvider`, fake or real; no model configuration UI.

---

## Baseline already complete (do not redo)

| Item | Status |
|------|--------|
| Monorepo + tooling | Done |
| Platform **interfaces** (including AI/plugin/scheduler contracts) | Done — interfaces only |
| Event catalog + `createInMemoryEventBus` | Done |
| Brand / architecture / ADR docs | Done |

Sprint 1 **implements and wires** desktop foundation services; it does not implement AI.

---

## Complexity key

| Rating | Meaning |
|--------|---------|
| **S** | Straightforward |
| **M** | Several modules / careful API |
| **L** | Cross-cutting or ADR-sensitive |

Task effort: **30 minutes – 4 hours** each.

---

## Architectural risks

| Risk | Why it matters | Mitigation |
|------|----------------|------------|
| **R1 — Tauri ↔ TypeScript embedding** | Wrong host model becomes Electron-in-disguise or untestable | Story **DF-01** / RFC before deep wiring; keep webview free of ambient Node |
| **R2 — Accidental network in foundation** | Privacy by default | No network services registered in DI; logger/error reporter local-only; tests assert no `fetch` |
| **R3 — Plugin/extension loaders that are too powerful too early** | Bypass approval / egress | Loaders register **empty**; no `send` capabilities granted; fail closed |
| **R4 — DI becomes a god object** | Manifesto: replaceable modules | Thin composition root; register interfaces only; no product facades yet |
| **R5 — AI sneaking into Sprint 1** | Scope discipline | Explicit non-goal; no provider registration in DI |
| **R6 — Cluttered shell** | Brand: one job per view | Placeholder nav only; no dashboards, no stats, no pressure CTAs |

---

## Story dependency order

```
DF-01 Launch desktop application
DF-02 Create shell layout
DF-03 Create logging
DF-04 Create error reporting
DF-05 Register dependency injection          ← composition root
DF-06 Register event bus                     ← into DI
DF-07 Create settings service                ← storage + DI
DF-08 Create theme system                    ← settings + shell
DF-09 Create plugin loader                   ← DI, empty, fail-closed
DF-10 Create extension manager               ← DI, empty, fail-closed
```

Logging/error reporting may start before DI as pure modules, then get registered in DF-05.

---

## Stories

### DF-01 — Launch desktop application

**As a** developer  
**I want** to launch a JobJitsu desktop window  
**So that** we have a native shell for the Career OS.

**Complexity:** L  

**Acceptance criteria**

- [x] Documented command opens a window titled **JobJitsu**.
- [x] Uses Tauri (ADR 0001); **no Electron**.
- [x] Webview does not get ambient filesystem/network APIs.
- [x] `app/README.md` documents run steps (macOS minimum).
- [x] Short note on chosen TS host approach (link or inline) — no AI runtime.

**Tasks** (dependency order)

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-01-T1 | Decide/document Tauri↔TS approach for Sprint 1 (RFC stub OK) | 2–4h | — |
| DF-01-T2 | Scaffold Tauri app under `app/` | 3–4h | T1 |
| DF-01-T3 | Wire workspace scripts to launch window | 1–2h | T2 |
| DF-01-T4 | Verify title + README run instructions | 30–60m | T3 |

**Status:** Done — `pnpm dev:desktop` / `app/src-tauri` (2026-07-23).

**Risks:** R1 (mitigated — Vite webview + thin Tauri host; see TAURI_TS_RUNTIME.md).

---

### DF-02 — Create shell layout

**As a** user  
**I want** a clean desktop layout with navigation and status  
**So that** the app feels calm and uncluttered from first open.

**Complexity:** M  

**Acceptance criteria**

- [ ] React UI mounts in the webview (ADR 0002).
- [ ] Layout: title bar + sidebar + main + status region.
- [ ] Nav placeholders: Dojo, Opportunities, Resume, Inbox, Recruiters, Analytics, Extensions, Settings.
- [ ] Every destination shows a calm **Coming Soon** placeholder (Dojo title: Welcome).
- [ ] Status shows static **Agent · On-device** — **not** LLM; **not** wired to AI health.
- [ ] Dark theme tokens applied to canvas (Midnight Ink).
- [ ] One main view at a time; no dashboard clutter.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-02-T1 | Add minimal design tokens (dark default) in `@jobjitsu/ui` | 2–3h | — |
| DF-02-T2 | React entry + shell layout components | 2–4h | DF-01, T1 |
| DF-02-T3 | Nav + placeholder main panes | 1–2h | T2 |
| DF-02-T4 | `JjAgentPrivacyPill` static presentational + a11y name | 1–2h | T2 |

**Risks:** R4, R6.

---

### DF-03 — Create logging

**As a** host developer  
**I want** a concrete local `Logger`  
**So that** the foundation can record diagnostics without cloud or PII dumps.

**Complexity:** S  

**Acceptance criteria**

- [ ] Implements `@jobjitsu/core` `Logger` / `LogSink`.
- [ ] Default sink is local (console or file under app data) — **no network**.
- [ ] `child()` merges fields immutably.
- [ ] Unit tests for levels + child.
- [ ] Docs: never log résumé bodies.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-03-T1 | Implement `createLogger` + console/file sink | 1–2h | — |
| DF-03-T2 | Unit tests | 30–60m | T1 |
| DF-03-T3 | Package README notes | 30m | T1 |

**Risks:** R2.

---

### DF-04 — Create error reporting

**As a** host developer  
**I want** local error reporting built on `AppError`  
**So that** failures are calm, recoverable, and private.

**Complexity:** S  

**Acceptance criteria**

- [ ] `ErrorReporter` interface + in-process implementation (log + optional in-memory ring buffer).
- [ ] Maps unknown errors to UI-safe `AppError` (no stack traces as titles).
- [ ] **No cloud crash reporter** registered.
- [ ] Unit tests for mapping + report.
- [ ] Aligns with brand error tone (plain, no blame).

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-04-T1 | Define `ErrorReporter` in `core` (or `app` host module) | 1–2h | — |
| DF-04-T2 | Implement local reporter using Logger | 1–2h | DF-03, T1 |
| DF-04-T3 | Tests for safe mapping | 1h | T2 |

**Risks:** R2 — never auto-upload.

---

### DF-05 — Register dependency injection

**As a** host developer  
**I want** a composition root that registers foundation services  
**So that** modules stay replaceable and testable.

**Complexity:** M  

**Acceptance criteria**

- [ ] Composition root boots in host (DI container or lightweight registry).
- [ ] Registers: Logger, ErrorReporter, (later) EventBus, Settings, PluginLoader, ExtensionManager.
- [ ] **Does not** register any AI provider or model service.
- [ ] Can resolve services in tests without UI.
- [ ] Documented “how to add a service” in `app/README.md` or architecture note.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-05-T1 | Choose minimal DI approach (e.g. typed registry) — document | 1–2h | — |
| DF-05-T2 | Implement composition root + register Logger/ErrorReporter | 2–3h | DF-03, DF-04, T1 |
| DF-05-T3 | Boot composition root from host startup | 1–2h | DF-01, T2 |
| DF-05-T4 | Unit test: resolve logger; assert no AI tokens in registry | 1h | T2 |

**Risks:** R4, R5.

---

### DF-06 — Register event bus

**As a** host developer  
**I want** the in-memory event bus registered in DI and available to the shell  
**So that** foundation services share one local nervous system.

**Complexity:** S  

**Acceptance criteria**

- [ ] Composition root provides `EventBus` via `createInMemoryEventBus`.
- [ ] Host (or smoke test) can publish/subscribe after boot.
- [ ] Optional durable memory sink hooked for durable names.
- [ ] **No** off-device event streaming.
- [ ] Tests: ordered delivery still holds when resolved from DI.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-06-T1 | Register bus (+ optional memory durable sink) in composition root | 1–2h | DF-05 |
| DF-06-T2 | Host smoke: publish `Agent.Idle`, assert handler | 1h | T1 |
| DF-06-T3 | Document bus lifecycle (process-local) | 30m | T1 |

**Risks:** R2.

---

### DF-07 — Create settings service

**As a** user  
**I want** settings persisted on this device with safe defaults  
**So that** approval-before-send stays on and theme defaults to dark.

**Complexity:** M  

**Acceptance criteria**

- [ ] On-device storage provider + `SettingsStore` implementation.
- [ ] Defaults match `DEFAULT_APP_SETTINGS` (approval on, sound off, dark).
- [ ] Registered in DI; get/set work across restart (same data root).
- [ ] May emit `Preferences.Changed` on bus.
- [ ] **No** AI model path UI required (field may exist unused in schema).
- [ ] Tests on temp directory; no network.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-07-T1 | Implement FS `StorageProvider` (KV minimum; blobs optional) | 2–4h | — |
| DF-07-T2 | Implement `createSettingsStore` | 2–3h | T1 |
| DF-07-T3 | Register storage + settings in DI | 1h | DF-05, T2 |
| DF-07-T4 | Persistence + defaults tests | 1–2h | T2 |
| DF-07-T5 | Optional IPC `settings.get` / `settings.set` allowlist | 2–3h | DF-01, T3 |

**Risks:** R2. Defer identity/resume import to a later epic.

---

### DF-08 — Create theme system

**As a** user  
**I want** dark-by-default theming with an optional light switch  
**So that** the shell matches JobJitsu visual identity.

**Complexity:** S  

**Acceptance criteria**

- [ ] Semantic tokens for dark (default) and light.
- [ ] Shell applies `data-theme` from settings.
- [ ] User can toggle theme in Preferences placeholder; persists via settings service.
- [ ] No off-brand purple/glow themes.
- [ ] Privacy pill remains readable in both themes.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-08-T1 | Complete light semantic token map if not done in DF-02 | 1–2h | DF-02 |
| DF-08-T2 | Bind theme to settings in shell | 1–2h | DF-07, DF-02 |
| DF-08-T3 | Preferences toggle UI (calm, sentence case) | 1–2h | T2 |
| DF-08-T4 | Manual or component test for theme attribute | 30–60m | T2 |

**Risks:** R6.

---

### DF-09 — Create plugin loader

**As a** host developer  
**I want** a capability-gated plugin loader that starts empty  
**So that** extensibility exists without enabling any skills yet.

**Complexity:** M  

**Acceptance criteria**

- [ ] Implements `PluginHost` (or subset): list/enable/disable/invoke fail-closed.
- [ ] Discovers **zero** plugins by default (or only disabled placeholders).
- [ ] Invoke on missing/disabled plugin returns denied `Result`.
- [ ] Registered in DI; **no AI capabilities exercised**.
- [ ] Unit tests for fail-closed behavior.
- [ ] Cannot grant implicit send execute.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-09-T1 | Implement empty/in-memory plugin host | 2–3h | plugin-sdk interfaces |
| DF-09-T2 | Register in DI | 30–60m | DF-05, T1 |
| DF-09-T3 | Fail-closed invoke/enable tests | 1–2h | T1 |
| DF-09-T4 | README: plugins off until user enables (none shipped) | 30m | T1 |

**Risks:** R3, R5.

---

### DF-10 — Create extension manager

**As a** host developer  
**I want** an extension manager that registers contribution points with nothing loaded  
**So that** Horizon 4 hooks exist without product extensions yet.

**Complexity:** M  

**Acceptance criteria**

- [ ] Extension registry interface in `@jobjitsu/extension-sdk` (if missing) + manager impl.
- [ ] Contribution point types exist; **zero** contributions registered at boot.
- [ ] Register/unregister API fail-closed for unknown types.
- [ ] Registered in DI; no discovery/send channels attached.
- [ ] Unit tests for empty registry.
- [ ] Docs state extensions are user-enabled later.

**Tasks**

| ID | Task | Effort | Depends |
|----|------|--------|---------|
| DF-10-T1 | Flesh out extension registry interfaces (contracts only if needed) | 1–2h | — |
| DF-10-T2 | Implement empty `ExtensionManager` | 2–3h | T1 |
| DF-10-T3 | Register in DI | 30–60m | DF-05, T2 |
| DF-10-T4 | Empty-registry tests | 1h | T2 |
| DF-10-T5 | README / architecture cross-link | 30m | T2 |

**Risks:** R3, R5.

---

## Capacity sketch

| Band | Stories | Approx. hours |
|------|---------|----------------|
| Shell | DF-01, DF-02, DF-08 | ~25–40h |
| Observability | DF-03, DF-04 | ~6–10h |
| Composition | DF-05, DF-06 | ~8–12h |
| Settings | DF-07 | ~10–15h |
| Extensibility stubs | DF-09, DF-10 | ~10–15h |

**Total:** roughly **60–90 hours** (about **1–2 weeks** for 1–2 developers) if AI and product loops stay out.

---

## Definition of Done (every story)

Apply the repository [Definition of Done](../../DEFINITION_OF_DONE.md):

**documented · tested · typed · reviewed · follows architecture · passes lint · passes build**

Plus Sprint 1 constraints:

1. Plan before code ([AI_DEVELOPMENT_WORKFLOW.md](../../AI_DEVELOPMENT_WORKFLOW.md)).
2. Story acceptance criteria met.
3. Branding: Agent · On-device; no pressure; no LLM in chrome.
4. **No AI services** introduced.
5. No new cloud dependencies; deny-by-default IPC where UI talks to host.

---

## Explicit non-goals (Sprint 1)

- Any **AI** provider, fake model, tailor, embed, or model-path settings UI
- Identity/resume import product flow
- Applications, queue, send, follow-ups product UX
- Real plugin skills or extension contributions
- Job boards, scraping, telemetry SDKs
- Autopilot / approval bypass

---

## Suggested vertical-slice sequence

Work **one story at a time** in this order:

1. DF-01 Launch desktop application  
2. DF-02 Create shell layout  
3. DF-03 Create logging  
4. DF-04 Create error reporting  
5. DF-05 Register dependency injection  
6. DF-06 Register event bus  
7. DF-07 Create settings service  
8. DF-08 Create theme system  
9. DF-09 Create plugin loader  
10. DF-10 Create extension manager  

---

## References

- [MANIFESTO.md](../../MANIFESTO.md)
- [architecture/DESKTOP_ARCHITECTURE.md](../architecture/DESKTOP_ARCHITECTURE.md)
- [architecture/PLUGIN_ARCHITECTURE.md](../architecture/PLUGIN_ARCHITECTURE.md)
- [architecture/EXTENSION_SYSTEM.md](../architecture/EXTENSION_SYSTEM.md)
- [BRANDING_FOR_DEVELOPMENT.md](../brand/BRANDING_FOR_DEVELOPMENT.md)
- [adr/0001-tauri.md](../adr/0001-tauri.md) · [adr/0002-react.md](../adr/0002-react.md) · [adr/0013-ipc-bridge.md](../adr/0013-ipc-bridge.md)
