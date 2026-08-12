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
  return Buffer.from(bytes)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}
