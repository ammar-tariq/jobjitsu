import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { DataRootSnapshot, LocalModelsListStatus, ThemePreference } from "../ipc/commands.js";
import { JjPage, JjSection } from "./layout/index.js";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";

export type PreferencesViewProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly bridge: IpcBridge;
};

/**
 * Preferences — data folder, approval gate, craft tone, on-device Agent model, appearance.
 */
export function PreferencesView({
  theme,
  onThemeChange,
  bridge,
}: PreferencesViewProps): JSX.Element {
  const [dataRoot, setDataRoot] = useState<DataRootSnapshot | null>(null);
  const [dataPathDraft, setDataPathDraft] = useState("");
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const [savingDataRoot, setSavingDataRoot] = useState(false);
  const [modelPathDraft, setModelPathDraft] = useState("");
  const [modelStatus, setModelStatus] = useState<string | null>(null);
  const [savingModelPath, setSavingModelPath] = useState(false);
  const [localModels, setLocalModels] = useState<readonly string[]>([]);
  const [listStatus, setListStatus] = useState<LocalModelsListStatus | null>(null);
  const [listMessage, setListMessage] = useState<string | null>(null);
  const [listingModels, setListingModels] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [toneDraft, setToneDraft] = useState("");
  const [craftStatus, setCraftStatus] = useState<string | null>(null);
  const [savingCraft, setSavingCraft] = useState(false);
  const [resetProfiles, setResetProfiles] = useState(false);
  const [resetJobMail, setResetJobMail] = useState(false);
  const [resetApplications, setResetApplications] = useState(false);
  const [resetCraft, setResetCraft] = useState(false);
  const [resetTimeline, setResetTimeline] = useState(false);
  const [resetAgentModel, setResetAgentModel] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  const refreshLocalModels = (): void => {
    setListingModels(true);
    void bridge.listLocalModels().then((result) => {
      setListingModels(false);
      if (!result.ok) {
        setLocalModels([]);
        setListStatus("unavailable");
        setListMessage(result.error.message ?? result.error.title);
        return;
      }
      setLocalModels(result.value.models);
      setListStatus(result.value.listStatus);
      setListMessage(result.value.message ?? null);
    });
  };

  useEffect(() => {
    let cancelled = false;
    void bridge.getDataRoot().then((result) => {
      if (!cancelled && result.ok) {
        setDataRoot(result.value.dataRoot);
        setDataPathDraft(result.value.dataRoot.path);
      }
    });
    void bridge.getLocalModelPath().then((result) => {
      if (!cancelled && result.ok) {
        setModelPathDraft(result.value.path ?? "");
      }
    });
    void bridge.getApprovalBeforeSend().then((result) => {
      if (!cancelled && result.ok) {
        setRequireApproval(result.value.requireApprovalBeforeSend);
      }
    });
    void bridge.getCraftPreferences().then((result) => {
      if (!cancelled && result.ok) {
        setToneDraft(result.value.craft.tone);
      }
    });
    void bridge.listLocalModels().then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setLocalModels([]);
        setListStatus("unavailable");
        setListMessage(result.error.message ?? result.error.title);
        return;
      }
      setLocalModels(result.value.models);
      setListStatus(result.value.listStatus);
      setListMessage(result.value.message ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const onSaveModelPath = (): void => {
    setSavingModelPath(true);
    setModelStatus(null);
    void bridge.setLocalModelPath(modelPathDraft).then((result) => {
      setSavingModelPath(false);
      if (!result.ok) {
        setModelStatus(result.error.message ?? result.error.title);
        return;
      }
      setModelPathDraft(result.value.path ?? "");
      if (!result.value.path) {
        setModelStatus("Model cleared. Choose a local model so Agent can run on this device.");
        return;
      }
      setModelStatus("Model saved. Stored on this device.");
    });
  };

  const selectOptions =
    modelPathDraft.trim() && !localModels.includes(modelPathDraft.trim())
      ? [modelPathDraft.trim(), ...localModels]
      : localModels;

  const onToggleApproval = (_event: unknown, checked: boolean): void => {
    setRequireApproval(checked);
    setApprovalStatus(null);
    void bridge.setApprovalBeforeSend(checked).then((result) => {
      if (!result.ok) {
        setApprovalStatus(result.error.message ?? result.error.title);
        return;
      }
      setRequireApproval(result.value.requireApprovalBeforeSend);
      setApprovalStatus(
        result.value.requireApprovalBeforeSend
          ? "Approval required before anything leaves this device."
          : "Approval preference updated. You still choose every send.",
      );
    });
  };

  const onSaveCraft = (): void => {
    setSavingCraft(true);
    setCraftStatus(null);
    void bridge.setCraftPreferences({ tone: toneDraft }).then((result) => {
      setSavingCraft(false);
      if (!result.ok) {
        setCraftStatus(result.error.message ?? result.error.title);
        return;
      }
      setToneDraft(result.value.craft.tone);
      setCraftStatus("Writing voice saved. Stored on this device.");
    });
  };

  const onSaveDataRoot = (): void => {
    setSavingDataRoot(true);
    setDataStatus(null);
    void bridge.setDataRoot(dataPathDraft).then((result) => {
      setSavingDataRoot(false);
      if (!result.ok) {
        setDataStatus(result.error.message ?? result.error.title);
        return;
      }
      setDataRoot(result.value.dataRoot);
      setDataPathDraft(result.value.dataRoot.path);
      setDataStatus("Data folder updated. Stored on this device.");
    });
  };

  const onPickDataRoot = (): void => {
    setSavingDataRoot(true);
    setDataStatus(null);
    void bridge.pickDataRoot().then((result) => {
      setSavingDataRoot(false);
      if (!result.ok) {
        setDataStatus(result.error.message ?? result.error.title);
        return;
      }
      if (result.value.cancelled || !result.value.dataRoot) {
        setDataStatus("Folder picker cancelled. Nothing changed.");
        return;
      }
      setDataRoot(result.value.dataRoot);
      setDataPathDraft(result.value.dataRoot.path);
      setDataStatus("Data folder updated. Stored on this device.");
    });
  };

  const onResetDataRoot = (): void => {
    setSavingDataRoot(true);
    setDataStatus(null);
    void bridge.resetDataRoot().then((result) => {
      setSavingDataRoot(false);
      if (!result.ok) {
        setDataStatus(result.error.message ?? result.error.title);
        return;
      }
      setDataRoot(result.value.dataRoot);
      setDataPathDraft(result.value.dataRoot.path);
      setDataStatus("Restored the default data folder on this device.");
    });
  };

  const anyResetSelected =
    resetProfiles ||
    resetJobMail ||
    resetApplications ||
    resetCraft ||
    resetTimeline ||
    resetAgentModel;

  const onResetSelected = (): void => {
    if (!anyResetSelected || resetConfirm.trim().toLowerCase() !== "reset") {
      setResetStatus("Select what to clear, then type “reset” to confirm.");
      return;
    }
    setResetBusy(true);
    setResetStatus(null);
    void bridge
      .resetSelectedData({
        profiles: resetProfiles,
        jobMail: resetJobMail,
        applications: resetApplications,
        craft: resetCraft,
        timeline: resetTimeline,
        agentModelPath: resetAgentModel,
      })
      .then((result) => {
        setResetBusy(false);
        if (!result.ok) {
          setResetStatus(result.error.message ?? result.error.title);
          return;
        }
        setResetConfirm("");
        setResetStatus(
          result.value.cleared.length > 0
            ? `Cleared on this device: ${result.value.cleared.join(", ")}. .env was not touched.`
            : "Nothing was selected to clear.",
        );
      })
      .catch(() => {
        setResetBusy(false);
        setResetStatus("Could not reset. Try again.");
      });
  };

  const onBackupSelected = (): void => {
    if (!anyResetSelected) {
      setResetStatus("Select what to include in the backup.");
      return;
    }
    setResetBusy(true);
    setResetStatus(null);
    void bridge
      .backupSelectedData({
        profiles: resetProfiles,
        jobMail: resetJobMail,
        applications: resetApplications,
        craft: resetCraft,
        timeline: resetTimeline,
        agentModelPath: resetAgentModel,
      })
      .then((result) => {
        setResetBusy(false);
        if (!result.ok) {
          setResetStatus(result.error.message ?? result.error.title);
          return;
        }
        setResetStatus(
          result.value.backupPath
            ? `Backup saved on this device: ${result.value.backupPath}`
            : "Backup cancelled.",
        );
      })
      .catch(() => {
        setResetBusy(false);
        setResetStatus("Could not create a backup. Try again.");
      });
  };

  const onRestoreBackup = (): void => {
    setResetBusy(true);
    setResetStatus(null);
    void bridge.restoreSelectedData().then((result) => {
      setResetBusy(false);
      if (!result.ok) {
        setResetStatus(result.error.message ?? result.error.title);
        return;
      }
      setResetStatus(
        result.value.restored.length > 0
          ? `Restored on this device: ${result.value.restored.join(", ")}.`
          : "Restore cancelled.",
      );
    });
  };

  return (
    <JjPage
      testId="jj-preferences"
      title="Preferences"
      subtitle="Device folder, Agent model, approval, appearance, and Reset. Job Mail and Profile live in their own views."
      maxWidth="40rem"
    >
      <JjSection
        testId="jj-approval-before-send"
        title="Outbound approval"
        description="When this is on, JobJitsu asks before anything leaves this device. Agent never sends on its own."
      >
        <FormControlLabel
          control={
            <Switch
              checked={requireApproval}
              onChange={onToggleApproval}
              data-testid="jj-approval-switch"
            />
          }
          label="Require approval before send"
        />
        {approvalStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {approvalStatus}
          </Typography>
        ) : null}
      </JjSection>

      <JjSection
        testId="jj-craft-preferences"
        title="Writing voice"
        description="Optional tone for drafts (for example: calm and precise). Stored on this device."
      >
        <TextField
          label="Tone"
          value={toneDraft}
          onChange={(event) => setToneDraft(event.target.value)}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { "data-testid": "jj-craft-tone-input" } }}
        />
        <Button
          variant="outlined"
          onClick={onSaveCraft}
          disabled={savingCraft}
          sx={{ alignSelf: "flex-start" }}
        >
          Save writing voice
        </Button>
        {craftStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {craftStatus}
          </Typography>
        ) : null}
      </JjSection>

      <JjSection
        testId="jj-data-folder"
        title="Data folder"
        description="Profile, paths, résumés, applications, and preferences are saved as files in this folder on this device. Choose a folder you can back up."
      >
        <TextField
          label="Folder path"
          value={dataPathDraft}
          onChange={(event) => setDataPathDraft(event.target.value)}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { "data-testid": "jj-data-folder-input" } }}
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button variant="contained" onClick={onPickDataRoot} disabled={savingDataRoot}>
            Choose folder
          </Button>
          <Button
            variant="outlined"
            onClick={onSaveDataRoot}
            disabled={savingDataRoot || dataPathDraft.trim().length === 0}
          >
            Save path
          </Button>
          <Button
            variant="text"
            onClick={onResetDataRoot}
            disabled={savingDataRoot || !(dataRoot?.isCustom ?? false)}
          >
            Use default
          </Button>
        </Stack>
        {dataStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {dataStatus}
          </Typography>
        ) : null}
        {dataRoot ? (
          <Typography color="text.secondary" variant="body2">
            {dataRoot.isCustom ? "Custom folder" : "Default folder"} · {dataRoot.path}
          </Typography>
        ) : null}
      </JjSection>

      <JjSection
        testId="jj-local-model-path"
        title="On-device Agent model"
        description="Agent runs through local Ollama on this device. Choose an installed model from the list — nothing leaves this device until Agent is ready."
      >
        <FormControl size="small" fullWidth>
          <InputLabel id="jj-local-model-select-label">Installed model</InputLabel>
          <Select
            labelId="jj-local-model-select-label"
            label="Installed model"
            value={modelPathDraft}
            onChange={(event) => setModelPathDraft(String(event.target.value))}
            displayEmpty
            data-testid="jj-local-model-select"
            inputProps={{ "data-testid": "jj-local-model-path-input" }}
          >
            <MenuItem value="">
              <em>None selected</em>
            </MenuItem>
            {selectOptions.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={onSaveModelPath}
            disabled={savingModelPath || listingModels}
          >
            Save model
          </Button>
          <Button
            variant="outlined"
            onClick={refreshLocalModels}
            disabled={listingModels || savingModelPath}
            data-testid="jj-local-model-refresh"
          >
            {listingModels ? "Refreshing…" : "Refresh list"}
          </Button>
        </Stack>
        {modelStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {modelStatus}
          </Typography>
        ) : listMessage ? (
          <Typography
            role="status"
            color="text.secondary"
            variant="body2"
            data-testid="jj-local-model-list-status"
          >
            {listMessage}
          </Typography>
        ) : listStatus === "ready" && modelPathDraft.trim().length === 0 ? (
          <Typography role="status" color="text.secondary" variant="body2">
            Choose a local model so Agent can run on this device.
          </Typography>
        ) : null}
      </JjSection>

      <JjSection
        testId="jj-preferences-reset"
        title="Reset"
        description="Clear selected on-device data, or back it up first. Developer .env OAuth client ids are never deleted."
      >
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={resetProfiles}
                onChange={(_, checked) => setResetProfiles(checked)}
              />
            }
            label="Profiles, Paths, and résumés"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resetJobMail}
                onChange={(_, checked) => setResetJobMail(checked)}
              />
            }
            label="Job Mail (tokens, imported mail, cursors)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resetApplications}
                onChange={(_, checked) => setResetApplications(checked)}
              />
            }
            label="Applications, Queue, and Follow-ups"
          />
          <FormControlLabel
            control={
              <Checkbox checked={resetCraft} onChange={(_, checked) => setResetCraft(checked)} />
            }
            label="Craft session drafts"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resetTimeline}
                onChange={(_, checked) => setResetTimeline(checked)}
              />
            }
            label="Timeline / activity"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resetAgentModel}
                onChange={(_, checked) => setResetAgentModel(checked)}
              />
            }
            label="Agent model path preference"
          />
        </FormGroup>
        <TextField
          label="Type “reset” to confirm wipe"
          value={resetConfirm}
          onChange={(event) => setResetConfirm(event.target.value)}
          size="small"
          fullWidth
          autoComplete="off"
          data-testid="jj-reset-confirm"
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={onBackupSelected}
            disabled={resetBusy || !anyResetSelected}
            data-testid="jj-reset-backup"
          >
            Backup selected
          </Button>
          <Button
            variant="outlined"
            onClick={onRestoreBackup}
            disabled={resetBusy}
            data-testid="jj-reset-restore"
          >
            Restore backup…
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onResetSelected}
            disabled={resetBusy || !anyResetSelected}
            data-testid="jj-reset-wipe"
          >
            Clear selected
          </Button>
        </Stack>
        {resetStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {resetStatus}
          </Typography>
        ) : null}
      </JjSection>

      <JjSection testId="jj-appearance" title="Appearance">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={theme}
          onChange={(_event, value: ThemePreference | null) => {
            if (value) {
              onThemeChange(value);
            }
          }}
          aria-label="Appearance"
        >
          <ToggleButton value="dark">Dark</ToggleButton>
          <ToggleButton value="light">Light</ToggleButton>
        </ToggleButtonGroup>
      </JjSection>
    </JjPage>
  );
}
