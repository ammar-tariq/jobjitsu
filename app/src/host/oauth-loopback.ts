/**
 * Native loopback for Gmail / Outlook sign-in.
 * No-op outside Tauri — browser Vite cannot finish provider consent.
 */

import type { MailboxOAuthLoopback } from "@jobjitsu/mailbox";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

type LoopbackBindResult = {
  readonly redirectUri: string;
};

type LoopbackWaitResult = {
  readonly code?: string;
  readonly state?: string;
  readonly error?: string;
};

/**
 * Desktop OAuth port. Undefined in browser preview.
 */
export function createHostOAuthLoopback(): MailboxOAuthLoopback | undefined {
  if (!isTauriRuntime()) {
    return undefined;
  }
  return {
    async start() {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<LoopbackBindResult>("oauth_loopback_bind");
    },
    async openUrl(url) {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("open_oauth_url", { url });
    },
    async waitForCode() {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<LoopbackWaitResult>("oauth_loopback_wait");
    },
  };
}
