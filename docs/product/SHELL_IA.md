# Shell information architecture (PE21)

Agreed product flow for the desktop shell. Implementation ships as vertical slices under epic **PE21**.

Parent: [PLATFORM_SPECIFICATION.md](./PLATFORM_SPECIFICATION.md) · Stories: [../backlog/USER_STORIES.md](../backlog/USER_STORIES.md)

---

## Goals

1. Untangle Preferences — stop cramming Gmail, Paths, and device settings into one scroll.
2. Make the first-run → daily path obvious: **Profile → Job Mail → Paths / résumés → Applications**.
3. Connect surfaces where it helps (deep links, shared status, one sync story).
4. Offer a calm **clean slate** with selective wipe, backup, and restore (never touch repo `.env`).
5. Keep brand motion calm; accents follow the **app icon** (cyan + marigold) on Midnight Ink.

---

## Decided journey

```
Onboarding → Profile (identity)
         → Connect Gmail / Outlook (from Profile + Job Mail)
         → Job Mail (sync, import feed, classify)
         → Paths + résumés (e.g. Fullstack, React Native)
         → Applications (job-mail drafts + manual drafts)
         → Sources (Coming soon — discovery; later: résumé + JD craft assist)
         → Preferences (device, Agent model, approval, appearance, clean slate)
```

Laws stay fixed: local-first, Agent ≠ send, UI never calls AI, OAuth only for mail.

---

## Navigation (side menu)

Grouped, one job per view:

| Group | Item | Role |
| --- | --- | --- |
| **Work** | **Overview** | Calm charts from on-device applications (funnel, mix, rates) |
| | Craft | Résumé / cover from paste |
| | Applications | Drafts, attention, duplicates |
| | Queue | Ready-for-review gate |
| | Follow-ups | Local reminders |
| **You** | Profile | Identity, Paths, résumés, **Connect mailbox** CTA |
| | **Job Mail** | Sync, progress, imported mail feed (not a full inbox) |
| | Sources | Coming soon (multi-source + All; later résumé+JD assist) |
| **System** | Agent | Readiness + activity |
| | Timeline | Local activity |
| | Preferences | Device folder, model, approval, appearance, **Reset / backup** |

**Job Mail** is the product name for the dedicated mailbox surface (not bare “Mail” / “Inbox”).

Cross-links (connect where possible):

- Profile → “Open Job Mail” after connect  
- Job Mail → “Open Applications” when job-related mail appears  
- Applications → “Create a profile” when empty and no identity yet; “Connect in Job Mail” once a profile exists  
- **Connect Gmail / Outlook requires at least one profile** (UI + host gate)  
- Agent unavailable → Preferences model  
- Sources stub → link to Craft (prepare from résumé + JD) as the interim path  

---

## Surface ownership

| Concern | Lives in | Must not live in |
| --- | --- | --- |
| Connect Gmail / Outlook | Profile (CTA) + Job Mail (full) | Preferences (remove dump) |
| Sync / import feed / lookback | Job Mail | Preferences |
| OAuth client ids | Local `.env` only (never shown in UI) | Job Mail Advanced / Preferences fields |
| Paths + résumé versions | Profile | Preferences |
| Clean slate / backup / restore | Preferences → Reset | Hidden destructive menus |
| Agent model path | Preferences | — |
| Discovery crawler | Sources (stub now) | Preferences |

---

## Clean slate (Preferences → Reset)

User chooses **what** to clear via checkboxes:

- [ ] Profiles, Paths, and résumés  
- [ ] Job Mail (tokens, imported mail, cursors)  
- [ ] Applications, Queue, Follow-ups  
- [ ] Craft sessions / local drafts  
- [ ] Timeline / activity  
- [ ] Agent model path preference (optional)  

Always **keep**:

- Repo / machine `.env` OAuth client ids (never deleted by the app)  
- Ability to cancel  

Also:

- **Backup** — export a local archive of selected on-device data (user picks folder)  
- **Restore** — import a prior backup (explicit confirm)  
- Typed confirm for destructive wipe (e.g. type `reset`)  
- No remote upload of backup  

---

## Sources (Coming soon)

Stub screen with calm empty state:

- Planned sources: LinkedIn, job boards, company careers, **All**  
- Future: generate tailored materials from **Path résumé + JD** (host Agent; user owns send)  
- Until then: point to **Craft** and **Job Mail**  

No scrapers or network discovery in the first PE21 slices.

---

## Overview (local charts)

Default Work landing after onboarding. Reads `mailbox.getDashboard` only — no Agent calls, no send.

- **Funnel** — applied → responses → interviews → offers  
- **Pipeline mix** — active / awaiting / assessments / interviews / offers / rejected  
- **Recent rates** — response / interview / offer shares for the analytics window  

Empty state when there are no applications. Copy stays calm (not a score, not streaks).

---

## Layout pattern (list screens)

For Work list destinations (**Applications**, and later similar editors):

1. **List is primary** — search, filters, and rows fill the page (reading width).
2. **Create / edit in a dialog** — `New draft` or a row opens `JjEditorDialog`; the form is not a permanent second column.
3. **Queue / Follow-ups** stay list + inline actions (no create form).
4. **Profile** — full screen for the **active** identity; switch profiles via a select (no accordion tree).
5. **Job Mail** — session state lives in `MailboxSessionProvider` (survives nav); shell shows an import banner when syncing elsewhere.

One job per view; avoid permanent split panes for create/edit.

---

## Visual language (icon-aligned)

App icon accents (on black):

| Token role | Approx | Use |
| --- | --- | --- |
| Cyan / light blue | `#22D3EE` (align with current teal family) | Primary accent, links, focus, Job Mail |
| Marigold / orange | `#F5A524` | Secondary accent, Path chips, caution-positive energy (not error) |
| Canvas | Midnight Ink | Unchanged dark-first |

Motion: step fades, quiet progress, reduced-motion honor. No urgency theater.

Update design tokens in a dedicated polish slice so brand docs and CSS stay honest.

---

## Slice order

| Story | Deliverable |
| --- | --- |
| PE21-S01 | This plan + PLATFORM_SPEC / terminology / backlog updates + GitHub epic/stories |
| PE21-S02 | Nav groups + **Job Mail** view; move mailbox UI out of Preferences; Profile connect CTA |
| PE21-S03 | Preferences Reset: checkboxes, backup, restore; keep `.env` |
| PE21-S04 | Sources Coming soon stub + cross-links |
| PE21-S05 | Icon accent tokens + calm motion polish |

One story per PR. Do not start the next until the previous has an open PR.

---

## Non-goals for PE21

- Building a full email client  
- Shipping crawlers / scrapers  
- Cloud backup  
- Deleting developer `.env`  
- Renaming **Path** away from product terminology  
