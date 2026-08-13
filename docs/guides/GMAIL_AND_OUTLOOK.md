# Connect Gmail or Outlook

Import job mail onto this device. JobJitsu **never asks for your mailbox password**, never stores tokens in the UI, and **never sends mail** from this path.

You must use the **desktop app**. Browser-only Vite (`pnpm dev:app`) cannot finish Google or Microsoft sign-in.

```bash
pnpm install
pnpm --filter @jobjitsu/ui build
pnpm dev:desktop
```

Or: `pnpm --filter @jobjitsu/app dev:tauri`.

---

## How credentials work

JobJitsu does **not** ship a shared Google Cloud or Microsoft app. A Testing-mode OAuth client only allows listed test users, so one project cannot serve every clone.

| Who | What you do |
| --- | --- |
| You, on this machine | Put **your** Desktop client id/secret in a gitignored `.env`. Then **Connect Gmail** is one click. |
| Someone who cloned the repo | Create **their own** Google Cloud / Entra app (steps below), copy `.env.example` → `.env`, fill it in, then Connect. |

`.env` is gitignored. Never commit it. Preferences fields still work as an override if you prefer not to use `.env`.

A future packaged JobJitsu.app could ship a verified JobJitsu-owned OAuth client. That is a Google/Microsoft verification process — not this open-source clone path.

---

## 1. Create a Google Desktop OAuth client (once per clone)

This is **your** Google Cloud project — not a JobJitsu cloud.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick one you already own).
2. **APIs & Services → Library** → enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `JobJitsu` (or any name you like)
   - Add **your Gmail address** as a **test user**
   - Publishing status can stay **Testing**
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Copy **Client ID** and **Client secret**

Desktop clients allow loopback redirects (`http://127.0.0.1:…/oauth`) automatically. You do not add a redirect URI by hand.

Scopes requested later: `gmail.readonly` only. JobJitsu cannot send as you from this connection.

---

## 2. Put the keys in `.env` (recommended)

From the repo root:

```bash
cp .env.example .env
```

Edit `.env` (never commit this file):

```
JOBJITSU_GMAIL_CLIENT_ID=your-desktop-client-id.apps.googleusercontent.com
JOBJITSU_GMAIL_CLIENT_SECRET=your-desktop-client-secret
JOBJITSU_OUTLOOK_CLIENT_ID=
```

Restart the desktop app so Vite can load the file (`pnpm dev:desktop`).

---

## 3. Connect in JobJitsu

1. Open the **JobJitsu** native window.
2. Create a **Profile**, then open **Job Mail** → **Connect Gmail** (or Applications after you have a profile).
3. In the browser: choose your account → Allow (readonly). Close the tab when it says you can return to JobJitsu.
4. Wait until the connection shows **Connected**. Open **Applications**.

Client IDs and secrets stay in `.env` only. They are never shown or pasted in the UI.

---

## Outlook (Microsoft Entra)

1. Open [Microsoft Entra app registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) → **New registration**.
2. Accounts: personal Microsoft plus work/school (or whichever mailbox you use).
3. **Authentication → Add a platform → Mobile and desktop applications**
   - Redirect URI: `http://127.0.0.1:17342/oauth`
   - Enable **Allow public client flows**
4. **API permissions** (delegated): `Mail.Read`, `offline_access`. Grant admin consent only if your tenant requires it.
5. Copy the **Application (client) ID** into `.env` as `JOBJITSU_OUTLOOK_CLIENT_ID`.
6. Restart the desktop app → **Connect Outlook**.

---

## After you are connected

| Action | What happens |
| ------ | ------------ |
| First sync | Walks the lookback window. Job-related mail becomes applications, timeline, and “Needs your attention”. |
| **Sync now** | Incremental only (Gmail history / Outlook delta). Already-classified mail is not sent through the Agent again. |
| **Disconnect** | Removes tokens. Imported mail stays until you delete it. |
| **Delete imported mail** | Removes that connection’s mail and cursor on this device. |

Nothing is sent. Follow-ups and apply still require your approval elsewhere.

To try the intelligence path without Google: **Connect sample mailbox** (fixture mail, no account).

---

## If something goes wrong

| Message | What to do |
| ------- | ---------- |
| Add a Gmail client ID in a local .env… | Copy `.env.example` → `.env`, fill the Desktop client ID **and secret**, restart `pnpm dev:desktop`. |
| Open the JobJitsu desktop app… | You are in the browser preview. Quit it and run `pnpm dev:desktop`. |
| Sign-in was cancelled / timed out | Connect Gmail again. Finish the browser prompt within a few minutes. |
| Gmail access expired | Connect Gmail again. Tokens stay on this device; they are not recovered from the cloud. |
| Google “app not verified” / access blocked | Add your Gmail as a **test user** on **your** OAuth consent screen. |
| Token exchange failed | Confirm the client secret matches the Desktop client. Restart after editing `.env`. |

---

## Privacy

- `.env` holds **your** OAuth app credentials. It is gitignored. Desktop client secrets are not mailbox passwords.
- Tokens live in `mailbox.secrets` on this device. They are never returned over IPC.
- JobJitsu does not receive your Gmail password.
- Classification runs on this device (deterministic first; on-device Agent if it is ready).
- This path is inbound only. Outbound mail is a separate, approval-gated feature.
