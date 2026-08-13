import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { MailboxIntegrationSnapshot, MailboxSettingsSnapshot } from "../ipc/commands.js";
import { JjSection } from "./layout/index.js";

export type MailboxPreferencesProps = {
  readonly bridge: IpcBridge;
};

/**
 * Opt-in email intelligence — OAuth only, tokens stay in the host.
 */
export function MailboxPreferences({ bridge }: MailboxPreferencesProps): JSX.Element {
  const [integrations, setIntegrations] = useState<readonly MailboxIntegrationSnapshot[]>([]);
  const [settings, setSettings] = useState<MailboxSettingsSnapshot | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async (): Promise<void> => {
    const listed = await bridge.listMailboxIntegrations();
    if (listed.ok) {
      setIntegrations(listed.value.integrations);
    }
    const current = await bridge.getMailboxSettings();
    if (current.ok) {
      setSettings(current.value.settings);
    }
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

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

  const onConnectSample = (): void => {
    setBusy(true);
    setStatus(null);
    void bridge
      .connectSampleMailbox()
      .then(async (result) => {
        setBusy(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Sample mailbox connected. Processing stays on this device.");
        await refresh();
      })
      .catch(() => {
        setBusy(false);
        setStatus("Could not connect the sample mailbox. Try again.");
      });
  };

  const onBeginConnect = (provider: "gmail" | "outlook"): void => {
    setBusy(true);
    setStatus(
      provider === "gmail"
        ? "A browser window will open. Finish Gmail sign-in there. Access stays on this device."
        : "A browser window will open. Finish Outlook sign-in there. Access stays on this device.",
    );
    void bridge
      .beginMailboxConnect(provider)
      .then(async (result) => {
        setBusy(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus(result.value.message);
        await refresh();
      })
      .catch(() => {
        setBusy(false);
        setStatus("Could not start that connection. Try again.");
      });
  };

  const onSync = (id: string): void => {
    setBusy(true);
    void bridge.syncMailbox(id).then(async () => {
      setBusy(false);
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

  return (
    <JjSection
      testId="jj-mailbox-preferences"
      title="Email"
      description="Connect a mailbox to find applications, interviews, and assessments. Mail stays on this device. The first sync looks back by your chosen window; later Sync now only imports new mail. JobJitsu never asks for your password, and nothing is sent unless you choose to."
    >
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
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {integration.syncStatus === "syncing" || integration.syncStatus === "processing"
              ? `Syncing… ${integration.emailsProcessed}${
                  integration.emailsTotal ? ` / ${integration.emailsTotal}` : ""
                }`
              : `Last synced: ${integration.lastSyncedAt ?? "not yet"}`}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Processed {integration.emailsProcessed} · Job-related {integration.jobRelatedCount} ·
            Applications {integration.applicationsFound}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Later syncs only import new mail. Results stay on this device.
          </Typography>
          {integration.syncError ? <Alert severity="info">{integration.syncError}</Alert> : null}
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

      {status ? (
        <Typography color="text.secondary" variant="body2" data-testid="jj-mailbox-status">
          {status}
        </Typography>
      ) : null}
    </JjSection>
  );
}
