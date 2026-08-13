import { useEffect, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { AgentPrivacyState } from "@jobjitsu/ui";
import type { IpcBridge } from "../ipc/bridge.js";
import { agentPrivacyStateFromStatus } from "./agent-privacy.js";
import { useHostActivity } from "./HostProvider.js";
import { JjPage, JjSurface } from "./layout/index.js";

export type AgentViewProps = {
  readonly bridge: IpcBridge;
  readonly onOpenPreferences: () => void;
};

function privacyLabel(state: AgentPrivacyState): string {
  if (state === "on-device") {
    return "Agent · On-device";
  }
  if (state === "ready") {
    return "Agent · Ready";
  }
  return "Agent · Unavailable";
}

/**
 * Agent status for people — readiness and recent activity, not event-name theater.
 */
export function AgentView({ bridge, onOpenPreferences }: AgentViewProps): JSX.Element {
  const activity = useHostActivity();
  const [privacy, setPrivacy] = useState<AgentPrivacyState>("unavailable");
  const [modelPath, setModelPath] = useState<string | null>(null);
  const recent = activity.slice(-8).reverse();

  useEffect(() => {
    let cancelled = false;
    void bridge.getAiStatus().then((result) => {
      if (!cancelled && result.ok) {
        setPrivacy(agentPrivacyStateFromStatus(result.value));
      }
    });
    void bridge.getLocalModelPath().then((result) => {
      if (!cancelled && result.ok) {
        setModelPath(result.value.path);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [bridge, activity]);

  return (
    <JjPage
      testId="jj-agent-view"
      title="Agent"
      subtitle="On-device help for drafts and review. Agent prepares; you own send."
      maxWidth="40rem"
    >
      <JjSurface testId="jj-agent-status" spacing={1}>
        <Typography variant="subtitle1">
          {privacyLabel(privacy)}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {privacy === "unavailable"
            ? "Choose a local model in Preferences so Agent can run on this device."
            : modelPath
              ? `Using ${modelPath} on this device.`
              : "Agent is ready on this device."}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onOpenPreferences}
          sx={{ alignSelf: "flex-start" }}
        >
          Open Preferences
        </Button>
      </JjSurface>

      <Stack spacing={1}>
        <Typography variant="subtitle2">Recent activity</Typography>
        {recent.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Waiting for host activity…
          </Typography>
        ) : (
          <Stack spacing={1} component="ul" aria-label="Recent Agent activity" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {recent.map((entry, index) => (
              <JjSurface key={`${entry.name}-${entry.occurredAt}-${index}`} spacing={0.75}>
                <Typography variant="body2">{entry.summary}</Typography>
              </JjSurface>
            ))}
          </Stack>
        )}
      </Stack>
    </JjPage>
  );
}
