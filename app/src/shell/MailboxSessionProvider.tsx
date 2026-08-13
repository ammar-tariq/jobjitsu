import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import type { IpcBridge } from "../ipc/bridge.js";
import type { MailboxIntegrationSnapshot, MailboxSettingsSnapshot } from "../ipc/commands.js";

export type MailboxSession = {
  readonly integrations: readonly MailboxIntegrationSnapshot[];
  readonly settings: MailboxSettingsSnapshot | null;
  readonly hasProfile: boolean;
  readonly status: string | null;
  readonly busy: boolean;
  readonly connecting: boolean;
  readonly syncing: boolean;
  readonly primary: MailboxIntegrationSnapshot | undefined;
  readonly refresh: () => Promise<void>;
  readonly setStatus: (message: string | null) => void;
  readonly setSettings: (settings: MailboxSettingsSnapshot) => void;
  readonly connectSample: () => void;
  readonly beginConnect: (provider: "gmail" | "outlook") => void;
  readonly sync: (id: string) => void;
  readonly disconnect: (id: string) => void;
  readonly deleteImported: (id: string) => void;
  readonly saveSettings: () => void;
};

const MailboxSessionContext = createContext<MailboxSession | null>(null);

export type MailboxSessionProviderProps = {
  readonly bridge: IpcBridge;
  readonly children: ReactNode;
};

/**
 * Shell-scoped Job Mail session — survives nav away from Job Mail.
 * Polls while import/classify runs. Does not hold OAuth secrets.
 */
export function MailboxSessionProvider({
  bridge,
  children,
}: MailboxSessionProviderProps): JSX.Element {
  const [integrations, setIntegrations] = useState<readonly MailboxIntegrationSnapshot[]>([]);
  const [settings, setSettings] = useState<MailboxSettingsSnapshot | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
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
  }, [bridge]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
  }, [syncing, refresh]);

  const connectSample = useCallback((): void => {
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
  }, [bridge, hasProfile, refresh]);

  const beginConnect = useCallback(
    (provider: "gmail" | "outlook"): void => {
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
    },
    [bridge, hasProfile, refresh],
  );

  const sync = useCallback(
    (id: string): void => {
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
          setStatus(
            `Ready. Imported ${row.emailsIngested ?? row.emailsProcessed} · Classified ${row.emailsProcessed} · Job-related ${row.jobRelatedCount}.`,
          );
        }
        await refresh();
      });
    },
    [bridge, refresh],
  );

  const disconnect = useCallback(
    (id: string): void => {
      setBusy(true);
      void bridge.disconnectMailbox(id).then(async () => {
        setBusy(false);
        setStatus("Disconnected. Imported mail is still on this device until you delete it.");
        await refresh();
      });
    },
    [bridge, refresh],
  );

  const deleteImported = useCallback(
    (id: string): void => {
      setBusy(true);
      void bridge.deleteMailboxData(id).then(async () => {
        setBusy(false);
        setStatus("Imported mail for that connection was removed from this device.");
        await refresh();
      });
    },
    [bridge, refresh],
  );

  const saveSettings = useCallback((): void => {
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
  }, [bridge, settings]);

  const value = useMemo<MailboxSession>(
    () => ({
      integrations,
      settings,
      hasProfile,
      status,
      busy,
      connecting,
      syncing,
      primary: integrations[0],
      refresh,
      setStatus,
      setSettings,
      connectSample,
      beginConnect,
      sync,
      disconnect,
      deleteImported,
      saveSettings,
    }),
    [
      integrations,
      settings,
      hasProfile,
      status,
      busy,
      connecting,
      syncing,
      refresh,
      connectSample,
      beginConnect,
      sync,
      disconnect,
      deleteImported,
      saveSettings,
    ],
  );

  return <MailboxSessionContext.Provider value={value}>{children}</MailboxSessionContext.Provider>;
}

export function useMailboxSession(): MailboxSession {
  const ctx = useContext(MailboxSessionContext);
  if (!ctx) {
    throw new Error("useMailboxSession requires MailboxSessionProvider");
  }
  return ctx;
}
