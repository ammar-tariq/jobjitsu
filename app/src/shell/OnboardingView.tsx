import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import { JjSurface } from "./layout/index.js";

export type OnboardingViewProps = {
  readonly bridge: IpcBridge;
  readonly onFinished: () => void;
};

/**
 * First-run guide — profile, then on-device Agent model. Skip is allowed and persisted.
 */
export function OnboardingView({ bridge, onFinished }: OnboardingViewProps): JSX.Element {
  const [step, setStep] = useState<0 | 1>(0);
  const [displayName, setDisplayName] = useState("");
  const [modelPath, setModelPath] = useState("");
  const [models, setModels] = useState<readonly string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void bridge.listLocalModels().then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      setModels(result.value.models);
    });
    void bridge.getLocalModelPath().then((result) => {
      if (!cancelled && result.ok) {
        setModelPath(result.value.path ?? "");
      }
    });
    void bridge.getProfile().then((result) => {
      if (!cancelled && result.ok && result.value.profile) {
        setDisplayName(result.value.profile.displayName);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const finish = async (): Promise<void> => {
    const saved = await bridge.setOnboardingCompleted(true);
    if (!saved.ok) {
      setStatus(saved.error.message ?? saved.error.title);
      return;
    }
    onFinished();
  };

  const onSaveProfile = (): void => {
    if (displayName.trim().length === 0) {
      setStatus("Add a display name to continue, or skip for now.");
      return;
    }
    setBusy(true);
    setStatus(null);
    void bridge
      .setProfile({ displayName: displayName.trim() })
      .then(async (result) => {
        setBusy(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStep(1);
      })
      .catch(() => {
        setBusy(false);
        setStatus("Could not save that profile. Try again.");
      });
  };

  const onSaveModel = (): void => {
    setBusy(true);
    setStatus(null);
    void bridge
      .setLocalModelPath(modelPath)
      .then(async (result) => {
        setBusy(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        await finish();
      })
      .catch(() => {
        setBusy(false);
        setStatus("Could not save that model. Try again.");
      });
  };

  const onSkip = (): void => {
    setBusy(true);
    void finish()
      .catch(() => {
        setStatus("Could not skip onboarding. Try again.");
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const selectOptions =
    modelPath.trim() && !models.includes(modelPath.trim()) ? [modelPath.trim(), ...models] : models;

  return (
    <Stack
      spacing={3}
      data-testid="jj-onboarding"
      sx={{ maxWidth: "28rem", mx: "auto", py: 8, px: 3, width: "100%" }}
    >
      <JjSurface>
        <Stack spacing={1}>
          <Typography component="h1" variant="h1">
            JobJitsu
          </Typography>
          <Typography color="text.secondary">
            Local-first career OS. Your drafts stay on this device. Agent prepares; you own send.
          </Typography>
        </Stack>

        {step === 0 ? (
          <Stack spacing={1.5} data-testid="jj-onboarding-profile">
            <Typography component="h2" variant="h2">
              Your profile
            </Typography>
            <Typography color="text.secondary" variant="body2">
              A display name is enough to start. You can refine Paths and résumés later under
              Profile.
            </Typography>
            <TextField
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { "data-testid": "jj-onboarding-name" } }}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button variant="contained" onClick={onSaveProfile} disabled={busy}>
                Continue
              </Button>
              <Button variant="text" onClick={onSkip} disabled={busy}>
                Skip for now
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1.5} data-testid="jj-onboarding-model">
            <Typography component="h2" variant="h2">
              On-device Agent
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Choose a local Ollama model so Agent can draft on this device. You can change this
              later in Preferences.
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel id="jj-onboarding-model-label">Installed model</InputLabel>
              <Select
                labelId="jj-onboarding-model-label"
                label="Installed model"
                value={modelPath}
                onChange={(event) => setModelPath(String(event.target.value))}
                displayEmpty
                data-testid="jj-onboarding-model-select"
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
              <Button variant="contained" onClick={onSaveModel} disabled={busy}>
                Finish
              </Button>
              <Button variant="text" onClick={onSkip} disabled={busy}>
                Skip for now
              </Button>
            </Stack>
          </Stack>
        )}

        {status ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {status}
          </Typography>
        ) : null}
      </JjSurface>
    </Stack>
  );
}
