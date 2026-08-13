import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ApplicationSnapshot } from "../ipc/commands.js";
import { JjEmptyState, JjPage, jjListRowSx } from "./layout/index.js";

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
    <JjPage
      testId="jj-followups-view"
      title="Follow-ups"
      subtitle="Reminders stay on this device. Draft a note in Applications, then clear when you are done — JobJitsu never sends for you."
      maxWidth="40rem"
    >
      {items.length === 0 ? (
        <JjEmptyState
          testId="jj-followups-empty"
          title="No follow-ups scheduled"
          body="Add a follow-up date on an application when you want a gentle reminder."
        />
      ) : (
        <List dense disablePadding aria-label="Scheduled follow-ups">
          {items.map((application) => {
            const due = (application.followUpAt ?? "") <= today;
            return (
              <ListItem
                key={application.id}
                alignItems="flex-start"
                sx={jjListRowSx}
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
    </JjPage>
  );
}
