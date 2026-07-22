import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ProfileSnapshot, ThemePreference } from "../ipc/commands.js";

export type PreferencesViewProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly bridge: IpcBridge;
};

/** Preferences — profile + appearance; stored on this device. */
export function PreferencesView({
  theme,
  onThemeChange,
  bridge,
}: PreferencesViewProps): JSX.Element {
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void bridge.getProfile().then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      const next = result.value.profile;
      setProfile(next);
      setDisplayName(next?.displayName ?? "");
      setEmail(next?.email ?? "");
      setLocation(next?.location ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const onSaveProfile = (): void => {
    setSaving(true);
    setStatus(null);
    void bridge
      .setProfile({
        displayName,
        email: email || undefined,
        location: location || undefined,
      })
      .then((result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setProfile(result.value.profile);
        setStatus("Stored on this device.");
      });
  };

  return (
    <Stack spacing={3} data-testid="jj-preferences" sx={{ maxWidth: "40rem" }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Preferences
        </Typography>
        <Typography color="text.secondary">
          Profile and appearance stay on this device. Nothing is uploaded to a JobJitsu cloud.
        </Typography>
      </Stack>

      <Stack
        spacing={1.5}
        component="form"
        data-testid="jj-profile-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <Typography component="h3" variant="body2" color="text.secondary">
          Profile
        </Typography>
        <TextField
          label="Display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          size="small"
          required
          fullWidth
          autoComplete="name"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          size="small"
          fullWidth
          autoComplete="email"
        />
        <TextField
          label="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          size="small"
          fullWidth
          autoComplete="address-level2"
        />
        <Button
          variant="contained"
          onClick={onSaveProfile}
          disabled={saving || displayName.trim().length === 0}
        >
          Save profile
        </Button>
        {status ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {status}
          </Typography>
        ) : null}
        {profile ? (
          <Typography color="text.secondary" variant="body2">
            Last updated {new Date(profile.updatedAt).toLocaleString()}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={1}>
        <Typography component="h3" variant="body2" color="text.secondary">
          Appearance
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Dark is the default.
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={theme}
          aria-label="Appearance"
          onChange={(_event, next: ThemePreference | null) => {
            if (next) {
              onThemeChange(next);
            }
          }}
        >
          <ToggleButton value="dark" aria-label="Dark">
            Dark
          </ToggleButton>
          <ToggleButton value="light" aria-label="Light">
            Light
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
