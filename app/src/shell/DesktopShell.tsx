import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { AgentPrivacyState } from "@jobjitsu/ui";
import { JjAgentPrivacyPill } from "@jobjitsu/ui";
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
import { COMPACT_DRAWER_WIDTH, useShellLayout } from "./layout/index.js";
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
 * Desktop shell — side nav + main + always-visible Agent privacy bar.
 * Subscribes to host activity / craft session; must never import `@jobjitsu/ai`.
 */
export function DesktopShell({ theme, onThemeChange, bridge }: DesktopShellProps): JSX.Element {
  const [activeId, setActiveId] = useState<ShellNavId>(DEFAULT_SHELL_NAV_ID);
  const activity = useHostActivity();
  const craftSession = useHostCraftSession();
  const [agentPrivacy, setAgentPrivacy] = useState<AgentPrivacyState>("unavailable");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const layout = useShellLayout();
  const craftRunning = craftSession.job.status === "running";
  const drawerWidth = layout === "compact" ? COMPACT_DRAWER_WIDTH : DRAWER_WIDTH;

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
        data-layout={layout}
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
      data-layout={layout}
      data-testid="jj-desktop-shell"
      sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}
    >
      <SideMenu activeId={activeId} onSelect={setActiveId} layout={layout} />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: "100vh",
        }}
      >
        <Box
          component="main"
          id="main-content"
          sx={(muiTheme) => ({
            flexGrow: 1,
            backgroundColor: muiTheme.palette.background.default,
            overflow: "auto",
            minHeight: 0,
          })}
        >
          <Stack
            spacing={2.5}
            sx={{
              alignItems: "stretch",
              px: layout === "compact" ? 2 : 3,
              pb: 4,
              pt: 3,
              minHeight: "100%",
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
        <Box
          component="footer"
          data-testid="jj-shell-status-bar"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          <JjAgentPrivacyPill state={agentPrivacy} />
        </Box>
      </Box>
    </Box>
  );
}
