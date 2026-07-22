# Packages

TypeScript workspace packages for the JobJitsu AI Career Operating System.

| Package                          | Name                      | Role                             |
| -------------------------------- | ------------------------- | -------------------------------- |
| [core](./core)                   | `@jobjitsu/core`          | Shared foundations               |
| [events](./events)               | `@jobjitsu/events`        | Event contracts / bus interfaces |
| [storage](./storage)             | `@jobjitsu/storage`       | On-device persistence            |
| [identity](./identity)           | `@jobjitsu/identity`      | Profile & résumé                 |
| [preferences](./preferences)     | `@jobjitsu/preferences`   | User rules & gates               |
| [ai](./ai)                       | `@jobjitsu/ai`            | Local intelligence               |
| [discovery](./discovery)         | `@jobjitsu/discovery`     | Role sources & curation          |
| [applications](./applications)   | `@jobjitsu/applications`  | Application drafts               |
| [queue](./queue)                 | `@jobjitsu/queue`         | Review before send               |
| [send](./send)                   | `@jobjitsu/send`          | **Egress boundary**              |
| [followups](./followups)         | `@jobjitsu/followups`     | Polite nudges                    |
| [timeline](./timeline)           | `@jobjitsu/timeline`      | Audit / memory                   |
| [scheduler](./scheduler)         | `@jobjitsu/scheduler`     | Local jobs                       |
| [agent](./agent)                 | `@jobjitsu/agent`         | Preparative agent (≠ send)       |
| [plugin-sdk](./plugin-sdk)       | `@jobjitsu/plugin-sdk`    | Plugin contracts                 |
| [extension-sdk](./extension-sdk) | `@jobjitsu/extension-sdk` | Extension contracts              |
| [ui](./ui)                       | `@jobjitsu/ui`            | Design tokens & Jj* primitives   |

All packages are **scaffold-only** until backlog tasks land. See [architecture](../docs/architecture/PACKAGE_BOUNDARIES.md).
