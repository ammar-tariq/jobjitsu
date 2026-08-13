import type { JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MailboxEmailSnapshot } from "../ipc/commands.js";

export type MailboxImportFeedProps = {
  readonly emails: readonly MailboxEmailSnapshot[];
  readonly onOpenApplication?: (applicationId: string) => void;
};

type EmailGroup = {
  readonly key: string;
  readonly title: string;
  readonly subtitle: string;
  readonly emails: readonly MailboxEmailSnapshot[];
};

function groupLabel(email: MailboxEmailSnapshot): { readonly key: string; readonly title: string; readonly subtitle: string } {
  if (!email.processed) {
    return {
      key: "sorting",
      title: "Still sorting",
      subtitle: "Imported — classification runs on this device",
    };
  }
  if (email.isJobRelated) {
    const company = email.company?.trim() || "Job-related";
    return {
      key: `job:${company.toLowerCase()}`,
      title: company,
      subtitle: email.jobTitle?.trim() || email.classification || "Job mail",
    };
  }
  return {
    key: "other",
    title: "Not job-related",
    subtitle: "Kept on this device; not turned into applications",
  };
}

function groupEmails(emails: readonly MailboxEmailSnapshot[]): readonly EmailGroup[] {
  const map = new Map<string, EmailGroup>();
  for (const email of emails) {
    const meta = groupLabel(email);
    const existing = map.get(meta.key);
    if (existing) {
      map.set(meta.key, { ...existing, emails: [...existing.emails, email] });
    } else {
      map.set(meta.key, { ...meta, emails: [email] });
    }
  }
  const rows = [...map.values()];
  rows.sort((a, b) => {
    const rank = (key: string): number => {
      if (key === "sorting") {
        return 0;
      }
      if (key.startsWith("job:")) {
        return 1;
      }
      return 2;
    };
    const diff = rank(a.key) - rank(b.key);
    if (diff !== 0) {
      return diff;
    }
    return b.emails.length - a.emails.length;
  });
  return rows;
}

/**
 * Calm preview of imported mail — subjects grouped by company / type.
 * Not a full inbox; job mail is the product surface.
 */
export function MailboxImportFeed({
  emails,
  onOpenApplication,
}: MailboxImportFeedProps): JSX.Element | null {
  if (emails.length === 0) {
    return null;
  }
  const groups = groupEmails(emails);
  return (
    <Stack spacing={1.5} data-testid="jj-mailbox-import-feed">
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">Imported mail</Typography>
        <Typography color="text.secondary" variant="body2">
          Job-related messages become applications. Everything stays on this device.
        </Typography>
      </Stack>
      {groups.map((group) => (
        <Box
          key={group.key}
          data-testid={`jj-mailbox-group-${group.key}`}
          sx={{
            p: 1.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={0.75}>
            <Stack spacing={0.15}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {group.title}
                <Typography component="span" color="text.secondary" variant="body2">
                  {` · ${group.emails.length}`}
                </Typography>
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {group.subtitle}
              </Typography>
            </Stack>
            <Stack spacing={0.75}>
              {group.emails.slice(0, 8).map((email) => (
                <Box key={email.id} data-testid={`jj-mailbox-feed-email-${email.id}`}>
                  <Typography variant="body2">{email.subject || "(no subject)"}</Typography>
                  <Typography color="text.secondary" variant="caption" component="div">
                    {email.senderName || email.senderEmail}
                    {email.receivedAt ? ` · ${email.receivedAt.slice(0, 10)}` : ""}
                    {email.classification ? ` · ${email.classification.replaceAll("_", " ")}` : ""}
                  </Typography>
                  {email.snippet ? (
                    <Typography color="text.secondary" variant="caption" component="div">
                      {email.snippet.length > 120 ? `${email.snippet.slice(0, 117)}…` : email.snippet}
                    </Typography>
                  ) : null}
                  {email.applicationId && onOpenApplication ? (
                    <Typography
                      component="button"
                      type="button"
                      variant="caption"
                      onClick={() => onOpenApplication(email.applicationId!)}
                      sx={{
                        mt: 0.25,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "primary.main",
                        p: 0,
                        textAlign: "left",
                      }}
                    >
                      Open application
                    </Typography>
                  ) : null}
                </Box>
              ))}
              {group.emails.length > 8 ? (
                <Typography color="text.secondary" variant="caption">
                  +{group.emails.length - 8} more in this group
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
