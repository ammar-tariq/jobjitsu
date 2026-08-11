import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { AgentPrivacyState } from "@jobjitsu/ui";
import { DEFAULT_SHELL_NAV_ID, type ShellNavId } from "../index.js";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ThemePreference } from "../ipc/commands.js";
import { DRAWER_WIDTH } from "../theme/jjTheme.js";
import { agentPrivacyStateFromStatus } from "./agent-privacy.js";
import { AgentView } from "./AgentView.js";
import { ApplicationsView } from "./ApplicationsView.js";
import { CraftView } from "./CraftView.js";
import { FollowUpsView } from "./FollowUpsView.js";
import { useHostActivity, useHostCraftSession } from "./HostProvider.js";
import { OnboardingView } from "./OnboardingView.js";
import { PreferencesView } from "./PreferencesView.js";
import { ProfileView } from "./ProfileView.js";
import { QueueView } from "./QueueView.js";
import { SideMenu } from "./SideMenu.js";
import { TimelineView } from "./TimelineView.js";

export type DesktopShellProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly bridge: IpcBridge;
};

/**
 * Desktop shell — Material dashboard layout (side menu + main), JobJitsu content.
 * Subscribes to host activity / craft session; must never import `@jobjitsu/ai`.
 */
export function DesktopShell({ theme, onThemeChange, bridge }: DesktopShellProps): JSX.Element {
  const [activeId, setActiveId] = useState<ShellNavId>(DEFAULT_SHELL_NAV_ID);
  const activity = useHostActivity();
  const craftSession = useHostCraftSession();
  const [agentPrivacy, setAgentPrivacy] = useState<AgentPrivacyState>("unavailable");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const craftRunning = craftSession.job.status === "running";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    void bridge.getOnboardingCompleted().then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      setShowOnboarding(!result.value.completed);
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

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

  if (showOnboarding) {
    return (
      <Box
        className="jj-shell"
        data-theme={theme}
        data-testid="jj-desktop-shell"
        sx={{ minHeight: "100vh", bgcolor: "background.default" }}
      >
        <OnboardingView
          bridge={bridge}
          onFinished={() => {
            setShowOnboarding(false);
          }}
        />
      </Box>
    );
  }

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
          {craftRunning && activeId !== "craft" ? (
            <Alert
              severity="info"
              data-testid="jj-craft-running-banner"
              action={
                <Button color="inherit" size="small" onClick={() => setActiveId("craft")}>
                  Open Craft
                </Button>
              }
            >
              {craftSession.job.message ??
                "Agent is preparing Craft drafts on this device. You can keep browsing."}
            </Alert>
          ) : null}
          {activeId === "craft" ? (
            <CraftView bridge={bridge} />
          ) : activeId === "applications" ? (
            <ApplicationsView bridge={bridge} />
          ) : activeId === "queue" ? (
            <QueueView bridge={bridge} />
          ) : activeId === "follow-ups" ? (
            <FollowUpsView bridge={bridge} />
          ) : activeId === "agent" ? (
            <AgentView bridge={bridge} onOpenPreferences={() => setActiveId("preferences")} />
          ) : activeId === "profile" ? (
            <ProfileView bridge={bridge} />
          ) : activeId === "preferences" ? (
            <PreferencesView theme={theme} onThemeChange={onThemeChange} bridge={bridge} />
          ) : activeId === "timeline" ? (
            <TimelineView />
          ) : (
            <CraftView bridge={bridge} />
          )}
        </Stack>
      </Box>
    </Box>
  );
}
