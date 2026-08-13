import type { MailboxOAuthClientEnv } from "@jobjitsu/mailbox";

function pickEnv(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

/**
 * Desktop OAuth client ids from a gitignored `.env`.
 * Tests never read the developer’s keys. Tokens still stay in mailbox.secrets.
 */
export function readMailboxOAuthClientsFromEnv(): MailboxOAuthClientEnv {
  if (typeof process !== "undefined" && process.env.VITEST === "true") {
    return {};
  }
  const vite = import.meta.env;
  const node = typeof process !== "undefined" ? process.env : undefined;
  return {
    gmailClientId: pickEnv(vite.JOBJITSU_GMAIL_CLIENT_ID, node?.JOBJITSU_GMAIL_CLIENT_ID),
    gmailClientSecret: pickEnv(
      vite.JOBJITSU_GMAIL_CLIENT_SECRET,
      node?.JOBJITSU_GMAIL_CLIENT_SECRET,
    ),
    outlookClientId: pickEnv(vite.JOBJITSU_OUTLOOK_CLIENT_ID, node?.JOBJITSU_OUTLOOK_CLIENT_ID),
  };
}
