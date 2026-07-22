# ADR 0006: On-Device Storage

- **Status:** Accepted
- **Date:** 2026-07-22
- **Anchors:** [Monorepo](../architecture/MONOREPO.md) · [Package boundaries](../architecture/PACKAGE_BOUNDARIES.md)

---

## Context

Identity, résumés, preferences, queue, timeline, embeddings, and schedules are intimate. A default cloud database or sync service would violate non-goals. Storage must be inspectable, exportable later, and owned by the host process.

Alternatives considered:

| Option | Pros | Cons |
|--------|------|------|
| **Local DB + filesystem blobs via `packages/storage`** | Private, fast, testable | Multi-device sync is user problem (acceptable) |
| Hosted SaaS DB | Sync/marketing | Non-goal; hostage risk |
| Only flat JSON files | Simple | Weak querying/indexing for timeline & queue |
| Always-on end-to-end cloud sync | Convenience | Contradicts dojo model |

---

## Decision

**Persist all career data on-device** through `packages/storage`, invoked only from the host.

- Structured data: local embedded database (SQLite-class) for applications, queue, events/timeline, jobs, preferences.
- Large artifacts: local filesystem blobs (résumé files, exports) under the app user-data directory.
- Optional encryption-at-rest may be layered later; **default remains local**, not remote.
- No ambient sync to JobJitsu cloud object storage.
- Timeline stores egress audit (“what left / what stayed”).
- Future portability module exports explicitly; it does not imply continuous sync.

---

## Consequences

### Positive
- Matches privacy platform law and open trust.
- Domain packages stay testable with temp directories/DB fixtures.
- Clear backup story: user owns files on disk.

### Negative / tradeoffs
- No seamless multi-device résumé continuity without user-led export/import.
- Backup/migration tooling becomes a product responsibility later.

### Follow-ups
- Define schema migrations strategy in implementation RFC.
- Redact PII in shared diagnostics logs by default.
