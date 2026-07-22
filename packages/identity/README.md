# `@jobjitsu/identity`

Profile and résumé source of truth (local).

## Status

| Piece                                      | State                       |
| ------------------------------------------ | --------------------------- |
| `ResumeStore` / `ResumeDocument` contracts | Done                        |
| `createFakeResumeStore`                    | Done — **no PDF/OCR/cloud** |
| Real import / filesystem persistence       | Not yet                     |

## Fake Resume

```ts
import { createFakeResumeStore } from "@jobjitsu/identity";

const store = createFakeResumeStore();
const resume = await store.getResume();
```

Seeded fixture identity for demos and tests. Stays on-device in process memory.

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).
