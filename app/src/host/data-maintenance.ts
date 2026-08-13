import { joinStoragePath, resolveStorageLayout, type LocalFsIo } from "@jobjitsu/storage";
import type { ApplicationRepository } from "@jobjitsu/applications";
import type { MailboxService } from "@jobjitsu/mailbox";
import type { PreferencesFacade } from "@jobjitsu/preferences";
import type { CraftSessionStore } from "./craft-session.js";

export type DataResetSelection = {
  readonly profiles: boolean;
  readonly jobMail: boolean;
  readonly applications: boolean;
  readonly craft: boolean;
  readonly timeline: boolean;
  readonly agentModelPath: boolean;
};

export type DataMaintenanceDeps = {
  readonly io?: LocalFsIo;
  readonly getDataRootPath?: () => Promise<string | undefined>;
  readonly mailbox?: () => MailboxService | undefined;
  readonly applications?: () => ApplicationRepository | undefined;
  readonly preferences?: () => PreferencesFacade | undefined;
  readonly craftSession?: () => CraftSessionStore | undefined;
  readonly clearActivity?: () => void;
  readonly rebindStores?: () => Promise<void>;
  readonly pickDirectory?: () => Promise<string | undefined>;
};

const PROFILE_NS = ["identity", "identity.path", "identity.resume"] as const;
const MAILBOX_NS = [
  "mailbox.integrations",
  "mailbox.emails",
  "mailbox.actions",
  "mailbox.timeline",
  "mailbox.settings",
  "mailbox.index",
  "mailbox.secrets",
  "mailbox.cursors",
] as const;

async function removeKvNamespace(
  io: LocalFsIo,
  dataRoot: string,
  namespace: string,
): Promise<void> {
  const layout = resolveStorageLayout(dataRoot);
  const path = joinStoragePath(layout.kvRoot, namespace);
  if (await io.exists(path)) {
    await io.remove(path, { recursive: true });
  }
}

async function copyDir(io: LocalFsIo, from: string, to: string): Promise<void> {
  if (!(await io.exists(from))) {
    return;
  }
  await io.mkdir(to);
  for (const name of await io.readDir(from)) {
    const src = joinStoragePath(from, name);
    const dest = joinStoragePath(to, name);
    try {
      await io.readDir(src);
      await copyDir(io, src, dest);
    } catch {
      const bytes = await io.readBytes(src);
      await io.writeBytes(dest, bytes);
    }
  }
}

/**
 * Selective wipe / backup / restore for PE21 Reset.
 * Never touches developer `.env` OAuth client files.
 */
export function createDataMaintenance(deps: DataMaintenanceDeps) {
  return {
    async resetSelected(selection: DataResetSelection): Promise<readonly string[]> {
      const cleared: string[] = [];
      const mailbox = deps.mailbox?.();
      const applications = deps.applications?.();
      const preferences = deps.preferences?.();
      const craft = deps.craftSession?.();
      const dataRoot = await deps.getDataRootPath?.();
      const io = deps.io;

      if (selection.applications && applications) {
        const listed = await applications.list();
        for (const app of listed) {
          await applications.delete(app.id);
        }
        cleared.push("applications");
      }

      if (selection.jobMail && mailbox) {
        const integrations = await mailbox.listIntegrations();
        for (const row of integrations) {
          await mailbox.deleteImportedData(row.id);
        }
        cleared.push("job-mail");
      }

      if (selection.agentModelPath && preferences) {
        await preferences.setLocalModelPath(undefined);
        cleared.push("agent-model-path");
      }

      if (selection.craft && craft) {
        craft.reset();
        cleared.push("craft");
      }

      if (selection.timeline && deps.clearActivity) {
        deps.clearActivity();
        cleared.push("timeline");
      }

      if (selection.profiles && io && dataRoot) {
        for (const ns of PROFILE_NS) {
          await removeKvNamespace(io, dataRoot, ns);
        }
        // Also wipe resume blobs wholesale for a clean profile slate.
        const layout = resolveStorageLayout(dataRoot);
        if (await io.exists(layout.blobsRoot)) {
          await io.remove(layout.blobsRoot, { recursive: true });
          await io.mkdir(layout.blobsRoot);
        }
        cleared.push("profiles");
        await deps.rebindStores?.();
      } else if (
        (selection.jobMail || selection.applications) &&
        io &&
        dataRoot &&
        selection.jobMail
      ) {
        for (const ns of MAILBOX_NS) {
          await removeKvNamespace(io, dataRoot, ns);
        }
        await deps.rebindStores?.();
      }

      return cleared;
    },

    async backupSelected(selection: DataResetSelection): Promise<string | undefined> {
      const io = deps.io;
      const dataRoot = await deps.getDataRootPath?.();
      if (!io || !dataRoot) {
        throw new Error("Backup needs the desktop app data folder on this device.");
      }
      const destRoot = await deps.pickDirectory?.();
      if (!destRoot) {
        return undefined;
      }
      const stamp = new Date().toISOString().replaceAll(":", "-");
      const backupPath = joinStoragePath(destRoot, `JobJitsu-backup-${stamp}`);
      await io.mkdir(backupPath);
      const layout = resolveStorageLayout(dataRoot);
      const manifest = {
        version: 1,
        createdAt: new Date().toISOString(),
        selection,
      };
      await io.writeText(
        joinStoragePath(backupPath, "manifest.json"),
        JSON.stringify(manifest, null, 2),
      );

      const copyNs = async (namespace: string): Promise<void> => {
        const from = joinStoragePath(layout.kvRoot, namespace);
        const to = joinStoragePath(backupPath, "kv", namespace);
        await copyDir(io, from, to);
      };

      if (selection.profiles) {
        for (const ns of PROFILE_NS) {
          await copyNs(ns);
        }
        await copyDir(io, layout.blobsRoot, joinStoragePath(backupPath, "blobs"));
      }
      if (selection.jobMail) {
        for (const ns of MAILBOX_NS) {
          await copyNs(ns);
        }
      }
      if (selection.applications) {
        await copyNs("applications");
      }
      if (selection.agentModelPath) {
        await copyNs("config");
      }
      return backupPath;
    },

    async restoreSelected(): Promise<readonly string[]> {
      const io = deps.io;
      const dataRoot = await deps.getDataRootPath?.();
      if (!io || !dataRoot) {
        throw new Error("Restore needs the desktop app data folder on this device.");
      }
      const backupPath = await deps.pickDirectory?.();
      if (!backupPath) {
        return [];
      }
      const manifestPath = joinStoragePath(backupPath, "manifest.json");
      if (!(await io.exists(manifestPath))) {
        throw new Error("That folder does not look like a JobJitsu backup.");
      }
      const layout = resolveStorageLayout(dataRoot);
      const kvBackup = joinStoragePath(backupPath, "kv");
      if (await io.exists(kvBackup)) {
        const namespaces = await io.readDir(kvBackup);
        for (const ns of namespaces) {
          const from = joinStoragePath(kvBackup, ns);
          const to = joinStoragePath(layout.kvRoot, ns);
          if (await io.exists(to)) {
            await io.remove(to, { recursive: true });
          }
          await copyDir(io, from, to);
        }
      }
      const blobsBackup = joinStoragePath(backupPath, "blobs");
      if (await io.exists(blobsBackup)) {
        if (await io.exists(layout.blobsRoot)) {
          await io.remove(layout.blobsRoot, { recursive: true });
        }
        await copyDir(io, blobsBackup, layout.blobsRoot);
      }
      await deps.rebindStores?.();
      return ["backup"];
    },
  };
}
