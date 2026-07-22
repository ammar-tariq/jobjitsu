# Packages

TypeScript workspace packages for the JobJitsu AI Career Operating System.

## Foundation spine (build order)

```
shared → events → logger → config → core → sdk → testing
```

| Package              | Name                | Role                                           |
| -------------------- | ------------------- | ---------------------------------------------- |
| [shared](./shared)   | `@jobjitsu/shared`  | Result, IDs, pipeline stages                   |
| [events](./events)   | `@jobjitsu/events`  | Event catalog + in-memory bus                  |
| [logger](./logger)   | `@jobjitsu/logger`  | Local logger + sinks                           |
| [config](./config)   | `@jobjitsu/config`  | App settings + memory store                    |
| [core](./core)       | `@jobjitsu/core`    | Kernel: re-exports, ErrorReporter, DI registry |
| [sdk](./sdk)         | `@jobjitsu/sdk`     | Public plugin SDK surface (**no AI**)          |
| [testing](./testing) | `@jobjitsu/testing` | Test helpers for the spine                     |

## Domain & UI

| Package                          | Name                      | Role                                             |
| -------------------------------- | ------------------------- | ------------------------------------------------ |
| [storage](./storage)             | `@jobjitsu/storage`       | On-device persistence                            |
| [identity](./identity)           | `@jobjitsu/identity`      | Profile & résumé                                 |
| [preferences](./preferences)     | `@jobjitsu/preferences`   | Re-exports config + domain prefs                 |
| [ai](./ai)                       | `@jobjitsu/ai`            | Local intelligence (**untouched in foundation**) |
| [discovery](./discovery)         | `@jobjitsu/discovery`     | Role sources & curation                          |
| [applications](./applications)   | `@jobjitsu/applications`  | Application drafts                               |
| [queue](./queue)                 | `@jobjitsu/queue`         | Review before send                               |
| [send](./send)                   | `@jobjitsu/send`          | **Egress boundary**                              |
| [followups](./followups)         | `@jobjitsu/followups`     | Polite nudges                                    |
| [timeline](./timeline)           | `@jobjitsu/timeline`      | Audit / memory                                   |
| [scheduler](./scheduler)         | `@jobjitsu/scheduler`     | Local jobs                                       |
| [agent](./agent)                 | `@jobjitsu/agent`         | Preparative agent (≠ send)                       |
| [plugin-sdk](./plugin-sdk)       | `@jobjitsu/plugin-sdk`    | Plugin contracts                                 |
| [extension-sdk](./extension-sdk) | `@jobjitsu/extension-sdk` | Extension contracts                              |
| [ui](./ui)                       | `@jobjitsu/ui`            | Design tokens & Jj* primitives                   |

See [architecture](../docs/architecture/PACKAGE_BOUNDARIES.md).
