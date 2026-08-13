import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ApplicationSnapshot } from "../ipc/commands.js";
import { JjEmptyState, JjPage, JjSurface } from "./layout/index.js";

export type QueueViewProps = {
  readonly bridge: IpcBridge;
};

/**
 * Review queue — Ready for review → Approve (stays on device) or keep drafting.
 * Never sends.
 */
export function QueueView({ bridge }: QueueViewProps): JSX.Element {
  const [items, setItems] = useState<readonly ApplicationSnapshot[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async (): Promise<void> => {
    const result = await bridge.listApplications();
    if (!result.ok) {
      setStatus(result.error.message ?? result.error.title);
      return;
    }
    setItems(result.value.applications.filter((app) => app.stage === "queue"));
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const onApprove = (id: string): void => {
    setBusyId(id);
    setStatus(null);
    void bridge
      .updateApplicationDraft({ id, stage: "approve" })
      .then(async (result) => {
        setBusyId(null);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Approved on this device. Nothing was sent.");
        await refresh();
      })
      .catch(() => {
        setBusyId(null);
        setStatus("Could not update that application. Try again.");
      });
  };

  const onKeepDrafting = (id: string): void => {
    setBusyId(id);
    setStatus(null);
    void bridge
      .updateApplicationDraft({ id, stage: "tailor" })
      .then(async (result) => {
        setBusyId(null);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Returned to drafting. Nothing was sent.");
        await refresh();
      })
      .catch(() => {
        setBusyId(null);
        setStatus("Could not update that application. Try again.");
      });
  };

  return (
    <JjPage
      testId="jj-queue-view"
      title="Queue"
      subtitle="Review applications marked ready. Approve keeps them on this device — JobJitsu does not send for you."
      maxWidth="40rem"
    >
      {items.length === 0 ? (
        <JjSurface>
          <JjEmptyState
            testId="jj-queue-empty"
            title="Nothing ready for review"
            body="Mark an application Ready for review from Applications when you want a calm check before approval."
          />
        </JjSurface>
      ) : (
        <Stack spacing={1.5} aria-label="Ready for review">
          {items.map((application) => (
            <JjSurface
              key={application.id}
              testId={`jj-queue-row-${application.id}`}
              spacing={1}
            >
              <ListItemText
                primary={`${application.companyName} · ${application.roleTitle}`}
                secondary={application.trackingStatus}
              />
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={busyId === application.id}
                  onClick={() => onApprove(application.id)}
                  data-testid={`jj-queue-approve-${application.id}`}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={busyId === application.id}
                  onClick={() => onKeepDrafting(application.id)}
                  data-testid={`jj-queue-keep-${application.id}`}
                >
                  Keep drafting
                </Button>
              </Stack>
            </JjSurface>
          ))}
        </Stack>
      )}

      {status ? (
        <Typography role="status" color="text.secondary" variant="body2">
          {status}
        </Typography>
      ) : null}
    </JjPage>
  );
}
