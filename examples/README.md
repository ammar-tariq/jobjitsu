# Fake providers

Development and test doubles for JobJitsu. **No real integrations.**

| Fake   | Package               | Factory                  | Does not connect    |
| ------ | --------------------- | ------------------------ | ------------------- |
| AI     | `@jobjitsu/ai`        | `createFakeAiProvider`   | Ollama / cloud LLMs |
| Gmail  | `@jobjitsu/send`      | `createFakeGmailChannel` | Google / SMTP       |
| Jobs   | `@jobjitsu/discovery` | `createFakeJobsSource`   | Playwright / boards |
| Resume | `@jobjitsu/identity`  | `createFakeResumeStore`  | Cloud OCR / uploads |

```ts
import { createFakeAiProvider } from "@jobjitsu/ai";
import { createFakeGmailChannel } from "@jobjitsu/send";
import { createFakeJobsSource } from "@jobjitsu/discovery";
import { createFakeResumeStore } from "@jobjitsu/identity";
```

Use these to prove architecture and UI flows before wiring real adapters.
