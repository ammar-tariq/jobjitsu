/**
 * PKCE + loopback port for Gmail/Outlook. Tokens never travel this module —
 * the service exchanges the code and stores secrets in the host.
 */

export type MailboxOAuthLoopback = {
  readonly start: () => Promise<{ readonly redirectUri: string }>;
  readonly openUrl: (url: string) => Promise<void>;
  readonly waitForCode: () => Promise<{
    readonly code?: string;
    readonly state?: string;
    readonly error?: string;
  }>;
};

export type MailboxConnectResult = {
  readonly status: "needs_client_id" | "needs_desktop" | "needs_consent" | "connected" | "failed";
  readonly message: string;
};

/** Desktop OAuth app credentials — never a mailbox password. */
export type MailboxOAuthClientEnv = {
  readonly gmailClientId?: string;
  readonly gmailClientSecret?: string;
  readonly outlookClientId?: string;
};

export function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

export function mergeMailboxOAuthClients(
  settings: {
    readonly gmailClientId?: string;
    readonly gmailClientSecret?: string;
    readonly outlookClientId?: string;
  },
  env?: MailboxOAuthClientEnv,
): MailboxOAuthClientEnv {
  return {
    gmailClientId: firstNonEmpty(settings.gmailClientId, env?.gmailClientId),
    gmailClientSecret: firstNonEmpty(settings.gmailClientSecret, env?.gmailClientSecret),
    outlookClientId: firstNonEmpty(settings.outlookClientId, env?.outlookClientId),
  };
}

export type PkcePair = {
  readonly verifier: string;
  readonly challenge: string;
  readonly state: string;
};

export async function createPkcePair(): Promise<PkcePair> {
  const verifier = base64Url(randomBytes(32));
  const state = base64Url(randomBytes(16));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return {
    verifier,
    challenge: base64Url(new Uint8Array(digest)),
    state,
  };
}

function randomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}
