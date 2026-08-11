# `@jobjitsu/applications`

Application draft lifecycle — create/edit on-device drafts linked to résumés (role optional).

## Status

| Piece                                   | State                                  |
| --------------------------------------- | -------------------------------------- |
| Application entity + tracking stage map | Done (PE08-S01)                        |
| `createMemoryApplicationRepository`     | Done — browser-safe host               |
| `createApplicationDraft` / update       | Done — emits DraftCreated / Updated    |
| Duplicate soft-warn                     | Done — company + role + URL (+ req id) |
| List/detail UI polish                   | PE08-S04                               |
| Cover letter / tailor / send            | Later stories                          |

## Create a draft

```ts
import { createApplicationDraft, createMemoryApplicationRepository } from "@jobjitsu/applications";

const repository = createMemoryApplicationRepository();
const { application, duplicateWarning } = await createApplicationDraft({
  repository,
  input: {
    companyName: "Acme",
    roleTitle: "Staff Engineer",
    // roleId optional — Job Provider not required
  },
});
```

New drafts start at prep stage `discover` → tracking **Discovered**. Soft-duplicate warns; create still proceeds. Never sends.

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). This package must not call `send`.
