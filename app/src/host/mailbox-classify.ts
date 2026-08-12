import type { AiProvider } from "@jobjitsu/ai";
import {
  EMAIL_CLASSIFY_SYSTEM_PROMPT,
  buildEmailClassifyUserPrompt,
  type MailboxAiPort,
} from "@jobjitsu/mailbox";

/**
 * Host-owned mailbox classification — UI never calls AI.
 * Uses the on-device Agent when ready; mailbox falls back to deterministic rules.
 */
export function createMailboxAiPort(ai: AiProvider): MailboxAiPort {
  return {
    async classify(input) {
      const health = await ai.health();
      if (health.status !== "ready") {
        return "";
      }
      const result = await ai.complete({
        role: "email_classify",
        responseFormat: "json",
        prompt: `${EMAIL_CLASSIFY_SYSTEM_PROMPT}\n\n${buildEmailClassifyUserPrompt(input)}`,
      });
      return result.text;
    },
  };
}
