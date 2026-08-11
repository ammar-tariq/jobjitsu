import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { DataRootSnapshot, ThemePreference } from "../ipc/commands.js";

export type PreferencesViewProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly bridge: IpcBridge;
};

/**
 * Preferences — data folder (and appearance). Profile / Paths live under Profile.
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
        setModelStatus("Model path cleared. Choose a path so Agent can run on this device.");
        return;
      }
      setModelStatus("Model path saved. Stored on this device.");
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

      <Stack spacing={1.5} data-testid="jj-data-folder">
        <Typography component="h3" variant="body2" color="text.secondary">
          Data folder
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Profile, paths, resumes, and preferences are saved as files in this folder on this device.
          Choose a folder you can back up.
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
          Local model path
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Point Agent at an on-device model file or folder. If Agent shows Unavailable, confirm this
          path. Nothing leaves this device until Agent is ready.
        </Typography>
        <TextField
          label="Model path"
          value={modelPathDraft}
          onChange={(event) => setModelPathDraft(event.target.value)}
          size="small"
          fullWidth
          placeholder="/path/to/model"
          slotProps={{ htmlInput: { "data-testid": "jj-local-model-path-input" } }}
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button variant="contained" onClick={onSaveModelPath} disabled={savingModelPath}>
            Save model path
          </Button>
        </Stack>
        {modelStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {modelStatus}
          </Typography>
        ) : modelPathDraft.trim().length === 0 ? (
          <Typography role="status" color="text.secondary" variant="body2">
            Choose a local model path in Preferences so Agent can run on this device.
          </Typography>
        ) : null}
      </Stack>

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
