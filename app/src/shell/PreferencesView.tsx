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
import { MailboxPreferences } from "./MailboxPreferences.js";

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

  return (
    <Stack spacing={3} data-testid="jj-preferences" sx={{ maxWidth: "40rem" }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Preferences
        </Typography>
        <Typography color="text.secondary">
          Choose where JobJitsu keeps files on this device. Profile and Paths are under Profile.
        </Typography>
      </Stack>

      <Stack spacing={1.5} data-testid="jj-approval-before-send">
        <Typography component="h3" variant="body2" color="text.secondary">
          Outbound approval
        </Typography>
        <Typography color="text.secondary" variant="body2">
          When this is on, JobJitsu asks before anything leaves this device. Agent never sends on
          its own.
        </Typography>
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
      </Stack>

      <Stack spacing={1.5} data-testid="jj-craft-preferences">
        <Typography component="h3" variant="body2" color="text.secondary">
          Writing voice
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Optional tone for drafts (for example: calm and precise). Stored on this device.
        </Typography>
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
      </Stack>

      <Stack spacing={1.5} data-testid="jj-data-folder">
        <Typography component="h3" variant="body2" color="text.secondary">
          Data folder
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Profile, paths, résumés, applications, and preferences are saved as files in this folder
          on this device. Choose a folder you can back up.
        </Typography>
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
      </Stack>

      <Stack spacing={1.5} data-testid="jj-local-model-path">
        <Typography component="h3" variant="body2" color="text.secondary">
          On-device Agent model
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Agent runs through local Ollama on this device. Choose an installed model from the list —
          nothing leaves this device until Agent is ready.
        </Typography>
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
      </Stack>

      <MailboxPreferences bridge={bridge} />

      <Stack spacing={1.5} data-testid="jj-appearance">
        <Typography component="h3" variant="body2" color="text.secondary">
          Appearance
        </Typography>
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
      </Stack>
    </Stack>
  );
}
