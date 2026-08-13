import { useEffect, useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import type { AgentPrivacyState } from "@jobjitsu/ui";
import { JjAgentPrivacyPill } from "@jobjitsu/ui";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ProfileSnapshot, ThemePreference } from "../ipc/commands.js";
import { JjStepFade } from "./layout/JjStepFade.js";
import { JjStepper } from "./layout/JjStepper.js";
import {
  MAC_TRAFFIC_INSET_PX,
  TITLEBAR_HEIGHT_PX,
  detectShellPlatform,
} from "./platform.js";

export type TitleBarProps = {
  readonly bridge: IpcBridge;
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly agentPrivacy: AgentPrivacyState;
  readonly onOpenProfile: () => void;
};

/**
 * Native-feeling top bar — drag region, local profile switch, add identity.
 * Not a SaaS session: there is no logout or PIN on this device.
 */
export function TitleBar({
  bridge,
  theme,
  onThemeChange,
  agentPrivacy,
  onOpenProfile,
}: TitleBarProps): JSX.Element {
  const platform = detectShellPlatform();
  const [profiles, setProfiles] = useState<readonly ProfileSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<0 | 1>(0);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const refresh = async (): Promise<void> => {
    const listed = await bridge.listProfiles();
    if (listed.ok) {
      setProfiles(listed.value.profiles);
      setSelectedId(listed.value.selectedId);
    }
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const selected = profiles.find((row) => row.id === selectedId);
  const label = selected?.displayName.trim() || "Profile";

  const closeCreate = (): void => {
    setCreateOpen(false);
    setCreateStep(0);
    setDisplayName("");
    setEmail("");
    setLocation("");
    setStatus(null);
  };

  const onCreate = (): void => {
    if (displayName.trim().length === 0) {
      setStatus("Add a display name to continue.");
      return;
    }
    setBusy(true);
    void bridge
      .setProfile({
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        location: location.trim() || undefined,
        createNew: true,
      })
      .then(async (result) => {
        setBusy(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        closeCreate();
        await refresh();
        onOpenProfile();
      });
  };

  return (
    <Box
      component="header"
      className="jj-titlebar"
      data-testid="jj-shell-status-bar"
      data-tauri-drag-region
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minHeight: TITLEBAR_HEIGHT_PX,
        pl: platform === "macos" ? `${MAC_TRAFFIC_INSET_PX}px` : 1.5,
        pr: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 12, height: "100%" }} data-tauri-drag-region />
      <Stack
        className="jj-titlebar-controls"
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center" }}
      >
        <Button
          size="small"
          color="inherit"
          startIcon={<PersonOutlineRoundedIcon fontSize="small" />}
          onClick={(event) => setMenuEl(event.currentTarget)}
          aria-label="Switch profile"
          data-testid="jj-titlebar-profile"
          sx={{ textTransform: "none", maxWidth: "12rem" }}
        >
          <Typography variant="body2" noWrap>
            {label}
          </Typography>
        </Button>
        <IconButton
          size="small"
          aria-label="Add profile"
          onClick={() => {
            setCreateOpen(true);
            setCreateStep(0);
          }}
          data-testid="jj-titlebar-add-profile"
        >
          <AddRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label={theme === "dark" ? "Use light appearance" : "Use dark appearance"}
          onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
          data-testid="jj-titlebar-theme"
        >
          {theme === "dark" ? (
            <LightModeRoundedIcon fontSize="small" />
          ) : (
            <DarkModeRoundedIcon fontSize="small" />
          )}
        </IconButton>
        <JjAgentPrivacyPill state={agentPrivacy} />
      </Stack>

      <Menu
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={() => setMenuEl(null)}
      >
        {profiles.map((profile) => (
          <MenuItem
            key={profile.id}
            selected={profile.id === selectedId}
            onClick={() => {
              setMenuEl(null);
              void bridge.selectProfile(profile.id).then(() => refresh());
            }}
          >
            {profile.displayName}
          </MenuItem>
        ))}
        {profiles.length > 0 ? <Divider /> : null}
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            setCreateOpen(true);
            setCreateStep(0);
          }}
        >
          Add profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            onOpenProfile();
          }}
        >
          Switch profile
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="xs">
        <DialogTitle>Add profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <JjStepper steps={["Name", "Details"]} active={createStep} />
            <JjStepFade stepKey={createStep}>
              {createStep === 0 ? (
                <TextField
                  label="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  size="small"
                  fullWidth
                  autoFocus
                  slotProps={{ htmlInput: { "data-testid": "jj-titlebar-create-name" } }}
                />
              ) : (
                <Stack spacing={1.5}>
                  <TextField
                    label="Email (optional)"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Location (optional)"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    size="small"
                    fullWidth
                  />
                </Stack>
              )}
            </JjStepFade>
            {status ? (
              <Typography color="text.secondary" variant="body2">
                {status}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreate}>Cancel</Button>
          {createStep === 0 ? (
            <Button
              variant="contained"
              onClick={() => {
                if (displayName.trim().length === 0) {
                  setStatus("Add a display name to continue.");
                  return;
                }
                setStatus(null);
                setCreateStep(1);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button variant="contained" onClick={onCreate} disabled={busy}>
              Create profile
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
