import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type {
  MailboxEmailSnapshot,
  MailboxIntegrationSnapshot,
  MailboxSettingsSnapshot,
} from "../ipc/commands.js";
import { JjStepFade, JjStepper } from "./layout/index.js";
import { MailboxImportFeed } from "./MailboxImportFeed.js";

const SETUP_STEPS = ["Connect", "Import", "Classify", "Ready"] as const;

export type MailboxPreferencesProps = {
  readonly bridge: IpcBridge;
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

function progressValue(integration: MailboxIntegrationSnapshot): number | undefined {
  const total = integration.emailsTotal;
  if (!total || total <= 0) {
    return undefined;
  }
  return Math.min(100, Math.round((integration.emailsProcessed / total) * 100));
}

/**
 * Opt-in email intelligence — OAuth only, tokens stay in the host.
 * Setup reads like a short install wizard: connect → import → classify → ready.
 */
export function MailboxPreferences({ bridge }: MailboxPreferencesProps): JSX.Element {
  const [integrations, setIntegrations] = useState<readonly MailboxIntegrationSnapshot[]>([]);
  const [settings, setSettings] = useState<MailboxSettingsSnapshot | null>(null);
  const [recentEmails, setRecentEmails] = useState<readonly MailboxEmailSnapshot[]>([]);
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
    const recent = await bridge.listRecentMailboxEmails(50);
    if (recent.ok) {
      setRecentEmails(recent.value.emails);
    }
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const primary = integrations[0];
  const syncing =
    primary?.syncStatus === "syncing" ||
    primary?.syncStatus === "processing" ||
    integrations.some((row) => row.syncStatus === "syncing" || row.syncStatus === "processing");

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
  const pct = primary ? progressValue(primary) : undefined;

  const onConnectSample = (): void => {
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
      } else if (row.emailsProcessed === 0) {
        setStatus(
          "Import finished. No job-related mail in the lookback window yet — or enable Gmail API if sync keeps failing.",
        );
      } else {
        setStatus(
          `Ready. Processed ${row.emailsProcessed} · Job-related ${row.jobRelatedCount}.`,
        );
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
    void bridge.updateMailboxSettings(settings).then((result) => {
      setBusy(false);
      if (result.ok) {
        setSettings(result.value.settings);
        setStatus("Email settings saved on this device.");
      }
    });
  };

  const stepTitle =
    activeStep === 0
      ? "Connect a mailbox"
      : activeStep === 1
        ? "Importing mail"
        : activeStep === 2
          ? "Classifying on this device"
          : "Mailbox ready";

  const stepBody =
    activeStep === 0
      ? "Connect Gmail or Outlook. JobJitsu never asks for your mailbox password. Use the desktop app (not the browser preview)."
      : activeStep === 1
        ? "Pulling messages into local storage for your lookback window (or the whole mailbox if lookback is 0). Progress uses Gmail’s estimate — not your total account size."
        : activeStep === 2
          ? "Sorting job-related mail on this device. Nothing leaves the machine during classify."
          : "Open Applications to work on drafts from job mail. Later Sync now only imports new messages.";

  return (
    <Stack spacing={2} data-testid="jj-mailbox-preferences">
      <Stack spacing={0.75}>
        <Typography variant="h3">Email</Typography>
        <Typography color="text.secondary" variant="body2">
          Import job mail on this device. Agent can help you review it; you still own every send.
        </Typography>
      </Stack>

      <Stack
        spacing={2}
        data-testid="jj-mailbox-setup-wizard"
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "var(--jj-radius-lg)",
          bgcolor: "var(--jj-color-bg-elevated)",
        }}
      >
        <Stack spacing={0.5}>
          <Typography component="h4" variant="subtitle1" sx={{ fontWeight: 600 }}>
            Email setup
          </Typography>
          <Typography color="text.secondary" variant="body2">
            A short path: connect, import, classify, then you’re ready.
          </Typography>
        </Stack>

        <JjStepper steps={[...SETUP_STEPS]} active={activeStep} />

        <JjStepFade stepKey={activeStep}>
          <Stack spacing={1.5}>
            <Typography component="h5" variant="subtitle2">
              {stepTitle}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {stepBody}
            </Typography>

            {primary && (primary.syncStatus === "syncing" || primary.syncStatus === "processing") ? (
              <Stack spacing={1} data-testid="jj-mailbox-import-progress">
                <LinearProgress
                  variant={pct === undefined ? "indeterminate" : "determinate"}
                  value={pct}
                  aria-label={
                    primary.syncStatus === "syncing"
                      ? "Importing mail"
                      : "Classifying mail on this device"
                  }
                />
                <Typography variant="body2" color="text.secondary">
                  {primary.syncStatus === "syncing" ? "Importing" : "Classifying"}…{" "}
                  {primary.emailsProcessed}
                  {primary.emailsTotal
                    ? ` / ~${primary.emailsTotal} in this sync window`
                    : ""}
                  {pct !== undefined ? ` · ${pct}%` : ""}
                </Typography>
              </Stack>
            ) : null}

            {!primary?.connected ? (
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
              </Stack>
            ) : null}

            {primary ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
                data-testid={`jj-mailbox-integration-${primary.id}`}
              >
                <Stack spacing={0.75}>
                  <Typography variant="body2">
                    {primary.label}
                    {primary.emailAddress ? ` · ${primary.emailAddress}` : ""}
                    {primary.connected ? " · Connected" : " · Disconnected"}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Last synced: {primary.lastSyncedAt ?? "not yet"}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Processed {primary.emailsProcessed} · Job-related {primary.jobRelatedCount} ·
                    Applications {primary.applicationsFound}
                  </Typography>
                  {primary.syncError ? <Alert severity="info">{primary.syncError}</Alert> : null}
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", pt: 0.5 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onSync(primary.id)}
                      disabled={busy || syncing || !primary.connected}
                    >
                      Sync now
                    </Button>
                    <Button
                      size="small"
                      onClick={() => onDisconnect(primary.id)}
                      disabled={busy || syncing || !primary.connected}
                    >
                      Disconnect
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onDelete(primary.id)}
                      disabled={busy || syncing}
                    >
                      Delete imported mail
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : null}

            {status ? (
              <Alert
                severity={
                  /could not|fail|error|client id/i.test(status) ? "warning" : "info"
                }
                role="status"
                data-testid="jj-mailbox-status"
              >
                {status}
              </Alert>
            ) : null}

            <MailboxImportFeed emails={recentEmails} />
          </Stack>
        </JjStepFade>
      </Stack>

      {integrations.slice(1).map((integration) => (
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
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Processed {integration.emailsProcessed} · Job-related {integration.jobRelatedCount}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button size="small" onClick={() => onSync(integration.id)} disabled={busy}>
              Sync now
            </Button>
            <Button size="small" onClick={() => onDisconnect(integration.id)} disabled={busy}>
              Disconnect
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onDelete(integration.id)}
              disabled={busy}
            >
              Delete imported mail
            </Button>
          </Stack>
        </Stack>
      ))}

      {settings ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Advanced (optional)
          </Typography>
          <TextField
            label="Gmail client ID"
            value={settings.gmailClientId ?? ""}
            onChange={(event) => setSettings({ ...settings, gmailClientId: event.target.value })}
            size="small"
            fullWidth
            helperText="Optional when set in a local .env. Google Cloud Desktop client ID. Never your Gmail password."
          />
          <TextField
            label="Gmail client secret"
            value={settings.gmailClientSecret ?? ""}
            onChange={(event) =>
              setSettings({ ...settings, gmailClientSecret: event.target.value })
            }
            size="small"
            fullWidth
            type="password"
            autoComplete="off"
            helperText="Optional when set in a local .env. From the same Desktop client. Stored on this device."
          />
          <TextField
            label="Outlook client ID"
            value={settings.outlookClientId ?? ""}
            onChange={(event) => setSettings({ ...settings, outlookClientId: event.target.value })}
            size="small"
            fullWidth
            helperText="Optional when set in a local .env. Microsoft Entra application (client) ID."
          />
          <TextField
            label="Look back (days)"
            type="number"
            value={settings.lookbackDays}
            onChange={(event) =>
              setSettings({ ...settings, lookbackDays: Number(event.target.value) || 0 })
            }
            size="small"
            helperText="First sync only imports mail in this window (default 365). Set 0 to import the whole mailbox. Save, then Sync now. A large inbox can take a while."
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
            Save email settings
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
