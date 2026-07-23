import { useEffect, useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { AgentPrivacyState } from "@jobjitsu/ui";
import { DEFAULT_SHELL_NAV_ID, shellPageTitle, type ShellNavId } from "../index.js";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ThemePreference } from "../ipc/commands.js";
import { DRAWER_WIDTH } from "../theme/jjTheme.js";
import { agentPrivacyStateFromStatus } from "./agent-privacy.js";
import { ComingSoonView } from "./ComingSoonView.js";
import { EventActivityView } from "./EventActivityView.js";
import { useHostActivity } from "./HostProvider.js";
import { PreferencesView } from "./PreferencesView.js";
import { ProfileView } from "./ProfileView.js";
import { SideMenu } from "./SideMenu.js";

export type DesktopShellProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly bridge: IpcBridge;
};

/**
 * Desktop shell — Material dashboard layout (side menu + main), JobJitsu content.
 * Subscribes to host activity only; must never import `@jobjitsu/ai`.
 */
export function DesktopShell({ theme, onThemeChange, bridge }: DesktopShellProps): JSX.Element {
  const [activeId, setActiveId] = useState<ShellNavId>(DEFAULT_SHELL_NAV_ID);
  const title = shellPageTitle(activeId);
  const activity = useHostActivity();
  const [agentPrivacy, setAgentPrivacy] = useState<AgentPrivacyState>("unavailable");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    void bridge.getAiStatus().then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      setAgentPrivacy(agentPrivacyStateFromStatus(result.value));
    });
    return () => {
      cancelled = true;
    };
  }, [bridge, activity]);

  return (
    <Box
      className="jj-shell"
      data-theme={theme}
      data-testid="jj-desktop-shell"
      sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}
    >
      <SideMenu activeId={activeId} onSelect={setActiveId} agentPrivacy={agentPrivacy} />

      <Box
        component="main"
        id="main-content"
        sx={(muiTheme) => ({
          flexGrow: 1,
          backgroundColor: muiTheme.palette.background.default,
          overflow: "auto",
          minHeight: "100vh",
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: "stretch",
            mx: 3,
            pb: 5,
            pt: 3,
          }}
        >
          {activeId === "agent" ? (
            <EventActivityView />
          ) : activeId === "profile" ? (
            <ProfileView bridge={bridge} />
          ) : activeId === "preferences" ? (
            <PreferencesView theme={theme} onThemeChange={onThemeChange} bridge={bridge} />
          ) : (
            <ComingSoonView title={title} />
          )}
        </Stack>
      </Box>
    </Box>
  );
}
