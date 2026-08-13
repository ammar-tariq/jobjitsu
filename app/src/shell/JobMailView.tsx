import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { MailboxIntegrationSnapshot, MailboxSettingsSnapshot } from "../ipc/commands.js";
import { JjPage, JjSection } from "./layout/index.js";

const SETUP_STEPS = ["Connect", "Import", "Classify", "Ready"] as const;

export type JobMailViewProps = {
  readonly bridge: IpcBridge;
  readonly onOpenApplications?: () => void;
  readonly onOpenProfile?: () => void;
};

function wizardStepFor(
  integration: MailboxIntegrationSnapshot | undefined,
  connecting: boolean,
): number {
  if (connecting || !integration?.connected) {
    return 0;
  }
  if (integration.syncStatus === "syncing") {
    return 1;
  }
  if (integration.syncStatus === "processing") {
    return 2;
  }
  return 3;
}

/**
 * Job Mail — connect, sync, and review inbound job mail on this device.
 * Not a full inbox. Nothing sends from here.
 */
export function JobMailView({
  bridge,
  onOpenApplications,
  onOpenProfile,
}: JobMailViewProps): JSX.Element {
  const [integrations, setIntegrations] = useState<readonly MailboxIntegrationSnapshot[]>([]);
  const [settings, setSettings] = useState<MailboxSettingsSnapshot | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const refresh = async (): Promise<void> => {
    const listed = await bridge.listMailboxIntegrations();
    if (listed.ok) {
      setIntegrations(listed.value.integrations);
    }
    const current = await bridge.getMailboxSettings();
    if (current.ok) {
      setSettings(current.value.settings);
    }
    const profiles = await bridge.listProfiles();
    if (profiles.ok) {
      setHasProfile(profiles.value.profiles.length > 0);
    }
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const primary = integrations[0];
  const syncing = integrations.some(
    (row) => row.syncStatus === "syncing" || row.syncStatus === "processing",
  );

  useEffect(() => {
    if (!syncing) {
      return;
    }
    const id = window.setInterval(() => {
      void refresh();
    }, 1500);
    return () => window.clearInterval(id);
  }, [syncing, bridge]);

  const activeStep = wizardStepFor(primary, connecting);

  const onConnectSample = (): void => {
    if (!hasProfile) {
      setStatus("Create a profile first, then connect Job Mail.");
      return;
    }
    setBusy(true);
    setConnecting(true);
    setStatus(null);
    void bridge
      .connectSampleMailbox()
      .then(async (result) => {
        setBusy(false);
        setConnecting(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Sample mailbox connected. Processing stays on this device.");
        await refresh();
      })
      .catch(() => {
        setBusy(false);
        setConnecting(false);
        setStatus("Could not connect the sample mailbox. Try again.");
      });
  };

  const onBeginConnect = (provider: "gmail" | "outlook"): void => {
    if (!hasProfile) {
      setStatus("Create a profile first, then connect Job Mail.");
      return;
    }
    setBusy(true);
    setConnecting(true);
    setStatus(
      provider === "gmail"
        ? "A browser window will open. Finish Gmail sign-in there. Access stays on this device."
        : "A browser window will open. Finish Outlook sign-in there. Access stays on this device.",
    );
    void bridge
      .beginMailboxConnect(provider)
      .then(async (result) => {
        setBusy(false);
        setConnecting(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus(result.value.message);
        await refresh();
      })
      .catch(() => {
        setBusy(false);
        setConnecting(false);
        setStatus("Could not start that connection. Try again.");
      });
  };

  const onSync = (id: string): void => {
    setBusy(true);
    setStatus("Importing mail on this device…");
    void bridge.syncMailbox(id).then(async (result) => {
      setBusy(false);
      if (!result.ok) {
        setStatus(result.error.message ?? result.error.title);
        return;
      }
      const row = result.value.integration;
      if (row.syncError) {
        setStatus(row.syncError);
      } else {
        setStatus(`Ready. Processed ${row.emailsProcessed} · Job-related ${row.jobRelatedCount}.`);
      }
      await refresh();
    });
  };

  const onDisconnect = (id: string): void => {
    setBusy(true);
    void bridge.disconnectMailbox(id).then(async () => {
      setBusy(false);
      setStatus("Disconnected. Imported mail is still on this device until you delete it.");
      await refresh();
    });
  };

  const onDelete = (id: string): void => {
    setBusy(true);
    void bridge.deleteMailboxData(id).then(async () => {
      setBusy(false);
      setStatus("Imported mail for that connection was removed from this device.");
      await refresh();
    });
  };

  const onSaveSettings = (): void => {
    if (!settings) {
      return;
    }
    setBusy(true);
    void bridge
      .updateMailboxSettings({
        lookbackDays: settings.lookbackDays,
        noResponseAfterDays: settings.noResponseAfterDays,
        notifyAssessments: settings.notifyAssessments,
        notifyInterviews: settings.notifyInterviews,
        notifyRejections: settings.notifyRejections,
        notifyOffers: settings.notifyOffers,
      })
      .then((result) => {
        setBusy(false);
        if (result.ok) {
          setSettings(result.value.settings);
          setStatus("Job Mail settings saved on this device.");
        }
      });
  };

  return (
    <JjPage
      testId="jj-job-mail-view"
      title="Job Mail"
      subtitle="Create a profile first, then connect Gmail or Outlook. Import stays on this device — nothing is sent from here."
    >
      <JjSection
        testId="jj-mailbox-preferences"
        title="Email setup"
        description="A short path: profile, connect, import, classify, then you’re ready."
      >
        <Typography color="text.secondary" variant="body2">
          Step {activeStep + 1} of {SETUP_STEPS.length}: {SETUP_STEPS[activeStep]}
        </Typography>
        <Stack spacing={1.5}>
          {!hasProfile ? (
            <Stack spacing={1} data-testid="jj-mailbox-requires-profile">
              <Typography variant="body2">
                Create a profile before connecting Gmail or Outlook. Job mail links to your identity
                on this device.
              </Typography>
              {onOpenProfile ? (
                <Button
                  variant="contained"
                  onClick={onOpenProfile}
                  data-testid="jj-mailbox-open-profile"
                >
                  Open Profile
                </Button>
              ) : null}
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => onBeginConnect("gmail")}
                disabled={busy}
                data-testid="jj-mailbox-connect-gmail"
              >
                Connect Gmail
              </Button>
              <Button
                variant="outlined"
                onClick={() => onBeginConnect("outlook")}
                disabled={busy}
                data-testid="jj-mailbox-connect-outlook"
              >
                Connect Outlook
              </Button>
              <Button
                variant="text"
                onClick={onConnectSample}
                disabled={busy}
                data-testid="jj-mailbox-connect-sample"
              >
                Connect sample mailbox
              </Button>
              {onOpenApplications ? (
                <Button variant="text" onClick={onOpenApplications} disabled={busy}>
                  Open Applications
                </Button>
              ) : null}
            </Stack>
          )}
          {!hasProfile && onOpenApplications ? (
            <Button variant="text" onClick={onOpenApplications} disabled={busy}>
              Open Applications
            </Button>
          ) : null}

          {syncing && primary ? (
            <Stack spacing={1}>
              <LinearProgress
                variant={
                  primary.emailsTotal && primary.emailsTotal > 0 ? "determinate" : "indeterminate"
                }
                value={
                  primary.emailsTotal && primary.emailsTotal > 0
                    ? Math.min(
                        100,
                        Math.round((primary.emailsProcessed / primary.emailsTotal) * 100),
                      )
                    : undefined
                }
                aria-label="Importing job mail"
              />
              <Typography variant="body2" color="text.secondary">
                {primary.syncStatus === "processing" ? "Classifying" : "Importing"}…{" "}
                {primary.emailsProcessed}
                {primary.emailsTotal ? ` / ~${primary.emailsTotal} in this sync window` : ""}
              </Typography>
            </Stack>
          ) : null}

          {integrations.map((integration) => (
            <Stack
              key={integration.id}
              spacing={0.5}
              sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
              data-testid={`jj-mailbox-integration-${integration.id}`}
            >
              <Typography variant="subtitle2">
                {integration.label}
                {integration.emailAddress ? ` · ${integration.emailAddress}` : ""}
                {integration.connected ? " · Connected" : " · Disconnected"}
                {integration.syncStatus === "syncing" || integration.syncStatus === "processing"
                  ? ` · ${integration.syncStatus === "processing" ? "Classifying" : "Importing"}…`
                  : ""}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Last synced:{" "}
                {integration.lastSyncedAt
                  ? integration.lastSyncedAt.slice(0, 19).replace("T", " ")
                  : integration.syncStatus === "syncing" || integration.syncStatus === "processing"
                    ? "import in progress"
                    : integration.syncError
                      ? "paused — try Sync now"
                      : "not yet"}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Processed {integration.emailsProcessed} · Job-related {integration.jobRelatedCount}{" "}
                · Applications {integration.applicationsFound}
              </Typography>
              {integration.syncError ? (
                <Alert severity="info">{integration.syncError}</Alert>
              ) : null}
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onSync(integration.id)}
                  disabled={busy || syncing || !integration.connected}
                >
                  Sync now
                </Button>
                <Button
                  size="small"
                  onClick={() => onDisconnect(integration.id)}
                  disabled={busy || syncing || !integration.connected}
                >
                  Disconnect
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => onDelete(integration.id)}
                  disabled={busy || syncing}
                >
                  Delete imported mail
                </Button>
              </Stack>
            </Stack>
          ))}

          {status ? (
            <Alert
              severity={/could not|fail|error|client id/i.test(status) ? "warning" : "info"}
              role="status"
              data-testid="jj-mailbox-status"
            >
              {status}
            </Alert>
          ) : null}
        </Stack>
      </JjSection>

      {settings ? (
        <JjSection
          title="Advanced"
          description="Lookback and calm notices. OAuth client ids stay in a local .env — they are never shown here."
        >
          <TextField
            label="Look back (days)"
            type="number"
            value={settings.lookbackDays}
            onChange={(event) =>
              setSettings({ ...settings, lookbackDays: Number(event.target.value) || 0 })
            }
            size="small"
            helperText="First sync window. Set 0 for the whole mailbox. Save, then Sync now."
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyAssessments}
                onChange={(_, checked) => setSettings({ ...settings, notifyAssessments: checked })}
              />
            }
            label="Notice me about assessments"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyInterviews}
                onChange={(_, checked) => setSettings({ ...settings, notifyInterviews: checked })}
              />
            }
            label="Notice me about interviews"
          />
          <Button variant="outlined" onClick={onSaveSettings} disabled={busy}>
            Save Job Mail settings
          </Button>
        </JjSection>
      ) : null}
    </JjPage>
  );
}
