# `@jobjitsu/discovery`

Role discovery sources and curation contracts.

## Status

| Piece                             | State                               |
| --------------------------------- | ----------------------------------- |
| `DiscoverySource` / `RoleListing` | Done                                |
| `createFakeJobsSource`            | Done — **no Playwright / scrapers** |
| Real board adapters               | Not yet                             |

## Fake Jobs

```ts
import { createFakeJobsSource } from "@jobjitsu/discovery";

const source = createFakeJobsSource();
const roles = await source.list();
```

In-memory fixture listings for demos and tests.

See [docs/architecture/EXTENSION_SYSTEM.md](../../docs/architecture/EXTENSION_SYSTEM.md).
