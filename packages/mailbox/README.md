# `@jobjitsu/mailbox`

Inbound **email intelligence** for the job search — opt-in mailbox sync, classification, application matching, and pending actions.

This package **never sends mail**. Outbound career mail stays in `@jobjitsu/send`.

> Related (do not duplicate): PE20 Email Integration, PLATFORM_SPEC “Email Integration” / “Gmail Synchronization”, fake Gmail **send** channel in `@jobjitsu/send`, existing Application drafts in `@jobjitsu/applications`.

How to use it on your machine: [docs/guides/GMAIL_AND_OUTLOOK.md](../../docs/guides/GMAIL_AND_OUTLOOK.md).

## Status

| Piece                              | State                                          |
| ---------------------------------- | ---------------------------------------------- |
| Local KV email + integration store | Done (PE20)                                    |
| Fake / sample mailbox provider     | Done — no Google/Microsoft account             |
| Gmail + Outlook API adapters       | Done — OAuth tokens host-owned                 |
| Desktop OAuth loopback             | Done (PE20-S02) — Tauri bind / wait / open URL |
| Deterministic filter + classify    | Done                                           |
| Optional on-device Agent classify  | Done — host port; never from UI                |
| Application matching + timeline    | Done — extends existing Application            |
| Dashboard / actions / analytics    | Done via host IPC                              |
| Incremental sync cursors           | Done — persist across restart                  |

## Laws

- OAuth only — never store email passwords
- Tokens never leave the host (not in IPC results)
- UI never calls AI; host may classify via a local Agent port
- Do not send unrelated mail to a remote model
- User corrections override later sync
- Never auto-send follow-ups
- Low-confidence matches are not auto-merged

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).

## What is stored on this device

| Data                                      | Where                                  | Notes                                            |
| ----------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| Message metadata + snippet / body excerpt | `mailbox.emails`                       | Minimum needed to classify and show source mail  |
| OAuth tokens                              | `mailbox.secrets`                      | Never returned over IPC                          |
| Sync progress                             | `mailbox.integrations`                 | Counts and last-synced time                      |
| Sync cursor                               | `mailbox.cursors`                      | Watermark + provider history pointer — host only |
| Timeline + pending actions                | `mailbox.timeline` / `mailbox.actions` | Linked to Application ids                        |
| Client ids                                | `mailbox.settings`                     | Google / Microsoft app ids — not passwords       |

Disconnect removes tokens. **Delete imported mail** removes emails and the sync cursor for that connection so the next connect starts a fresh lookback.

## OAuth (Gmail / Outlook)

1. Create a **Desktop** OAuth client (Google Cloud or Microsoft Entra). See the [guide](../../docs/guides/GMAIL_AND_OUTLOOK.md).
2. Put the client ID (and Gmail client secret) in a gitignored `.env`, or paste them in Preferences → Email. JobJitsu never asks for your mailbox password.
3. **Connect Gmail** or **Connect Outlook** in the **desktop app**. The host binds `127.0.0.1`, opens the system browser, exchanges the code with PKCE, and stores tokens in `mailbox.secrets`. PKCE helpers use Web Crypto + `btoa`/`atob` (webview-safe; no Node `Buffer`).
4. First sync uses your lookback window. Later **Sync now** is incremental.

Browser-only Vite cannot finish consent — the UI explains that the desktop app is required.

Local `.env` (copy `.env.example`; never commit):

- `JOBJITSU_GMAIL_CLIENT_ID`
- `JOBJITSU_GMAIL_CLIENT_SECRET`
- `JOBJITSU_OUTLOOK_CLIENT_ID`

Preferences fields override `.env` when set. Each clone uses its own Google/Microsoft app — JobJitsu does not ship a shared cloud client.

## Agent

Classification is **deterministic first**. The host may call the on-device Agent (`email_classify`) when it is ready. Malformed JSON is discarded. The UI never imports `@jobjitsu/ai`.

## Sync cursors

The first sync walks the lookback window and writes a checkpoint after each page (`mailbox.cursors`). After that succeeds, later **Sync now** (including after app restart) uses the watermark and provider history pointer — Gmail `historyId`, Outlook delta/next links, or an exclusive timestamp for the sample mailbox. Already-classified mail is not sent through the Agent again. If a page fails, the next Sync now resumes from the saved page cursor.

## Limitations

- OS push notifications are not wired; in-app **Needs your attention** and Preferences notice toggles are.
- Split of an already-merged application is manual (un-archive is not a dedicated command); merge / keep separate are.
