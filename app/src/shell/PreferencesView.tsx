import type { JSX } from "react";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { ThemePreference } from "../ipc/commands.js";

export type PreferencesViewProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
};

/** Preferences — appearance only in W0; stored on this device. */
export function PreferencesView({ theme, onThemeChange }: PreferencesViewProps): JSX.Element {
  return (
    <Stack spacing={2} data-testid="jj-preferences" sx={{ maxWidth: "40rem" }}>
      <Typography component="h2" variant="h2">
        Preferences
      </Typography>
      <Typography color="text.secondary">
        Appearance stays on this device. Dark is the default.
      </Typography>

      <Stack spacing={1}>
        <Typography component="h3" variant="body2" color="text.secondary">
          Appearance
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
