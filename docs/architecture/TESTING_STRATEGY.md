# Testing Strategy

> Tests protect the promise: **on-device, on-target, on your terms.**

Parent: [OVERVIEW.md](./OVERVIEW.md) · Rule: [../../.cursor/rules/testing.mdc](../../.cursor/rules/testing.mdc)

---

## Goals

- Prove privacy and sovereignty boundaries continuously.
- Keep packages independently testable without the full GUI.
- Prefer user-guarantee language in test names — calm and precise.
- Never optimize the suite for vanity volume metrics or guilt UX.

---

## Test layers

| Layer | Scope | Examples |
|-------|--------|----------|
| **Unit** | Pure domain in packages | Queue policy, context assembler minimization, job idempotency |
| **Contract** | Package borders & SDKs | Plugin manifest validation; send façade requires approval |
| **Integration** | Host wiring + storage | Agent enqueue → approve → send attempted; timeline egress record |
| **Privacy / boundary** | Explicit egress & data plane | Résumé never in network mocks unless send path; AI default local |
| **UI** | Critical views & a11y | Badge semantics, focus order, live regions, reduced motion |
| **Plugin/extension** | Capability denial | Skill without `network` cannot fetch; cannot call raw send |

---

## Must-pass guarantees

These are release blockers conceptually (encode as automated tests when code exists):

1. **Privacy boundary** — identity/résumé/agent context do not leave device without explicit outbound action through `send`.
2. **Approval gates** — when require-approval is on, `send` does not execute without `Queue.Approved` (or Trusted Automation auto-approve audit path).
3. **Agent pause** — pause stops preparative work; queue intact; no send.
4. **Honest send outcomes** — `unknown` / partial never reported as success in UI state or events.
5. **Agent · On-device truth** — status chrome shows Agent · On-device only when the provider is local; remote config cannot spoof on-device.
6. **Capability gate** — disabled plugins do not run; missing permissions fail closed.
7. **Package fences** — see normative checklist in [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md) (agent↛send, ui↛ai, ui↛storage, discovery↛send, sdk↛ai).
7. **Scheduler calm** — no job type exists for inactivity shaming; quiet hours defer notifications.

---

## Event & timeline testing

- Assert durable recording of `Send.*` and `Privacy.EgressRecorded`.
- Assert UI batching helpers collapse multiple `Agent.Progress` into one user-visible string pattern.
- Assert payloads omit full résumé bodies on high-volume events.

---

## AI testing

- Context assembler includes only required fields (fixture résumé + role).
- Provider fake: local adapter used by default in tests.
- Remote adapter tests explicitly mark opt-in configuration.
- Prompt-injection fixtures: tools remain gated (job description cannot trigger egress).

---

## Desktop / IPC testing

- Bridge deny-by-default: UI cannot invoke arbitrary fs/net.
- Command `send.approveAndSend` respects preferences.
- Notification path: sound default off; follow-up uses caution not error.

---

## What we do not test for

- Maximum applications-per-hour throughput as a success metric.
- Streak counters or guilt copy snapshots.
- Employer-side ranking quality.
- “Guaranteed interview” claims.

---

## Naming tone

```
✅ keeps resume on device until user approves send
✅ marks send unknown when board response is ambiguous
✅ refuses plugin network call without capability

❌ crushes ATS and blasts 50 apps
❌ ensures engagement nag fires after 48h idle
```

---

## Fixtures & examples

- `examples/` holds synthetic résumés and manifests — never real user data in git.
- Prefer deterministic clocks for scheduler tests.

---

## Continuous verification (design)

- Unit + contract on every change.
- Integration + privacy boundary on mainline.
- UI a11y smoke on shell changes.
- Manual checklist for first outbound channel still valuable: honest unknown, approval, badge truth.
