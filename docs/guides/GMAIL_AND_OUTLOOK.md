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

## Find the controls

1. Open **JobJitsu** (native window).
2. Either:
   - **Applications** → **Connect Gmail** (empty list), or
   - **Preferences** → scroll to **Email**.
3. Paste your client ID (and Gmail client secret), click **Save email settings**, then **Connect Gmail**.

A system browser window opens. Finish consent there. The app captures the redirect on `127.0.0.1` and keeps tokens in `mailbox.secrets` on this device.

---

## Gmail (Google Cloud)

Do this once. It is a **Desktop** OAuth client for your own use — not a JobJitsu cloud.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick one you already own).
2. **APIs & Services → Library** → enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `JobJitsu` (or any name you like)
   - Add your Gmail address as a **test user**
   - Publishing status can stay **Testing**
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Copy **Client ID** and **Client secret**
5. In JobJitsu **Preferences → Email**:
   - Paste **Gmail client ID** and **Gmail client secret**
   - Set **Look back (days)** if you want a shorter first import (default 365)
   - **Save email settings**
   - **Connect Gmail**
6. In the browser: choose your account → Allow (readonly Gmail). Close the tab when it says you can return to JobJitsu.
7. Wait until the connection shows **Connected** and sync finishes. Open **Applications**.

Scopes requested: `gmail.readonly` only. JobJitsu cannot send as you from this connection.

Desktop clients allow loopback redirects (`http://127.0.0.1:…/oauth`) automatically. You do not add a redirect URI by hand.

---

## Outlook (Microsoft Entra)

1. Open [Microsoft Entra app registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) → **New registration**.
2. Accounts: personal Microsoft plus work/school (or whichever mailbox you use).
3. **Authentication → Add a platform → Mobile and desktop applications**
   - Redirect URI: `http://127.0.0.1:17342/oauth`
   - Enable **Allow public client flows**
4. **API permissions** (delegated): `Mail.Read`, `offline_access`. Grant admin consent only if your tenant requires it.
5. Copy the **Application (client) ID** into JobJitsu **Outlook client ID** → **Save email settings** → **Connect Outlook**.

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
| Add a Gmail client ID… | Paste the Desktop client ID **and secret**, then **Save email settings**, then Connect Gmail. |
| Open the JobJitsu desktop app… | You are in the browser preview. Quit it and run `pnpm dev:desktop`. |
| Sign-in was cancelled / timed out | Connect Gmail again. Finish the browser prompt within a few minutes. |
| Gmail access expired | Connect Gmail again. Tokens stay on this device; they are not recovered from the cloud. |
| Google “app not verified” / access blocked | Add your Gmail as a **test user** on the OAuth consent screen. |
| Token exchange failed | Confirm the client secret matches the Desktop client. Save settings, then connect again. |

---

## Privacy

- Tokens live in `mailbox.secrets` on this device. They are never returned over IPC.
- JobJitsu does not receive your Gmail password.
- Classification runs on this device (deterministic first; on-device Agent if it is ready).
- This path is inbound only. Outbound mail is a separate, approval-gated feature.
