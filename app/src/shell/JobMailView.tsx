import { useEffect, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { JjPage, JjSection } from "./layout/index.js";
import { useMailboxSession } from "./MailboxSessionProvider.js";

const SETUP_STEPS = ["Connect", "Import", "Classify", "Ready"] as const;

export type JobMailViewProps = {
  readonly onOpenApplications?: () => void;
  readonly onOpenProfile?: () => void;
};

function wizardStepFor(
  syncStatus: string | undefined,
  connected: boolean | undefined,
  connecting: boolean,
): number {
  if (connecting || !connected) {
    return 0;
  }
  if (syncStatus === "syncing") {
    return 1;
  }
  if (syncStatus === "processing") {
    return 2;
  }
  if (syncStatus === "failed" || syncStatus === "token_expired") {
    return 1;
  }
  return 3;
}

/**
 * Job Mail chrome — session state lives in MailboxSessionProvider.
 * Not a full inbox. Nothing sends from here.
 */
export function JobMailView({ onOpenApplications, onOpenProfile }: JobMailViewProps): JSX.Element {
  const session = useMailboxSession();
  const {
    integrations,
    settings,
    hasProfile,
    status,
    busy,
    connecting,
    syncing,
    primary,
    refresh,
    setSettings,
    beginConnect,
    connectSample,
    sync,
    disconnect,
    deleteImported,
    saveSettings,
  } = session;

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeStep = wizardStepFor(primary?.syncStatus, primary?.connected, connecting);
  const importCount = primary?.emailsIngested ?? 0;
  const classifyCount = primary?.emailsProcessed ?? 0;

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
                onClick={() => beginConnect("gmail")}
                disabled={busy}
                data-testid="jj-mailbox-connect-gmail"
              >
                Connect Gmail
              </Button>
              <Button
                variant="outlined"
                onClick={() => beginConnect("outlook")}
                disabled={busy}
                data-testid="jj-mailbox-connect-outlook"
              >
                Connect Outlook
              </Button>
              <Button
                variant="text"
                onClick={connectSample}
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
              <LinearProgress variant="indeterminate" aria-label="Importing job mail" />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontVariantNumeric: "tabular-nums" }}
                data-testid="jj-mailbox-sync-progress"
              >
                {primary.syncStatus === "processing"
                  ? `Classifying ${classifyCount} · Imported ${importCount}`
                  : `Importing ${importCount}`}
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
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ fontVariantNumeric: "tabular-nums" }}
                data-testid={`jj-mailbox-counts-${integration.id}`}
              >
                Imported {integration.emailsIngested ?? 0} · Classified{" "}
                {integration.emailsProcessed} · Job-related {integration.jobRelatedCount} ·
                Applications {integration.applicationsFound}
              </Typography>
              {integration.syncError ? (
                <Typography color="warning.main" variant="body2">
                  {integration.syncError}
                </Typography>
              ) : null}
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", pt: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => sync(integration.id)}
                  disabled={busy || syncing || !integration.connected}
                >
                  Sync now
                </Button>
                <Button
                  size="small"
                  onClick={() => disconnect(integration.id)}
                  disabled={busy || syncing}
                >
                  Disconnect
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteImported(integration.id)}
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
          <Button variant="outlined" onClick={saveSettings} disabled={busy}>
            Save Job Mail settings
          </Button>
        </JjSection>
      ) : null}
    </JjPage>
  );
}
