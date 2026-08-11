import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ApplicationSnapshot } from "../ipc/commands.js";

export type FollowUpsViewProps = {
  readonly bridge: IpcBridge;
};

/**
 * Local follow-up reminders — schedule lives on the application. Never sends.
 */
export function FollowUpsView({ bridge }: FollowUpsViewProps): JSX.Element {
  const [items, setItems] = useState<readonly ApplicationSnapshot[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const refresh = async (): Promise<void> => {
    const result = await bridge.listApplications();
    if (!result.ok) {
      setStatus(result.error.message ?? result.error.title);
      return;
    }
    setItems(
      result.value.applications
        .filter((app) => Boolean(app.followUpAt))
        .sort((a, b) => (a.followUpAt ?? "").localeCompare(b.followUpAt ?? "")),
    );
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const onDismiss = (id: string): void => {
    setBusyId(id);
    setStatus(null);
    void bridge
      .updateApplicationDraft({
        id,
        followUpAt: null,
        followUpDraftText: null,
      })
      .then(async (result) => {
        setBusyId(null);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Follow-up cleared. Nothing was sent.");
        await refresh();
      })
      .catch(() => {
        setBusyId(null);
        setStatus("Could not update that follow-up. Try again.");
      });
  };

  return (
    <Stack spacing={2} data-testid="jj-followups-view" sx={{ maxWidth: "40rem" }}>
      <Typography component="h2" variant="h2">
        Follow-ups
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Reminders stay on this device. Draft a note in Applications, then clear when you are done —
        JobJitsu never sends for you.
      </Typography>

      {items.length === 0 ? (
        <Stack spacing={0.5} data-testid="jj-followups-empty">
          <Typography variant="subtitle1">No follow-ups scheduled</Typography>
          <Typography color="text.secondary" variant="body2">
            Add a follow-up date on an application when you want a gentle reminder.
          </Typography>
        </Stack>
      ) : (
        <List dense disablePadding aria-label="Scheduled follow-ups">
          {items.map((application) => {
            const due = (application.followUpAt ?? "") <= today;
            return (
              <ListItem
                key={application.id}
                alignItems="flex-start"
                sx={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: 1,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
                data-testid={`jj-followup-row-${application.id}`}
              >
                <ListItemText
                  primary={`${application.companyName} · ${application.roleTitle}`}
                  secondary={`${due ? "Due" : "Scheduled"} ${application.followUpAt}${
                    application.followUpDraftText
                      ? ` — ${application.followUpDraftText.slice(0, 120)}`
                      : ""
                  }`}
                />
                <Button
                  variant="outlined"
                  size="small"
                  disabled={busyId === application.id}
                  onClick={() => onDismiss(application.id)}
                  data-testid={`jj-followup-dismiss-${application.id}`}
                >
                  Clear reminder
                </Button>
              </ListItem>
            );
          })}
        </List>
      )}

      {status ? (
        <Typography role="status" color="text.secondary" variant="body2">
          {status}
        </Typography>
      ) : null}
    </Stack>
  );
}
