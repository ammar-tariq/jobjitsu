# `@jobjitsu/send`

Outbound boundary — sole career-data egress.

## Status

| Piece                       | State                       |
| --------------------------- | --------------------------- |
| `SendChannel` contract      | Done                        |
| `createFakeGmailChannel`    | Done — **no Google / SMTP** |
| Real Gmail / board adapters | Not yet                     |

## Fake Gmail

```ts
import { createFakeGmailChannel } from "@jobjitsu/send";

const gmail = createFakeGmailChannel();
await gmail.send({/* … */});
gmail.outbox; // local only
```

Messages land in an in-memory outbox with an honest “not delivered” detail.

## Laws

- Agent must never call send channels directly
- Approval policy is enforced by the host/orchestrator, not skipped by fakes
- Never claim real-world delivery for fake channels

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).
