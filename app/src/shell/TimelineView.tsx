import type { JSX } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useHostActivity } from "./HostProvider.js";
import { JjEmptyState, JjPage } from "./layout/index.js";

const TIMELINE_NAMES = new Set([
  "Queue.Approved",
  "Queue.Rejected",
  "Queue.Enqueued",
  "FollowUp.Scheduled",
  "FollowUp.Dismissed",
  "Preferences.Changed",
  "Application.DraftCreated",
  "Application.StageChanged",
  "Ai.LocalModelReady",
  "Ai.LocalModelFailed",
  "Resume.Imported",
  "Resume.Attached",
]);

/**
 * Calm activity timeline from host events this session.
 * Durable cross-restart log ships later — still local-only.
 */
export function TimelineView(): JSX.Element {
  const activity = useHostActivity();
  const entries = activity
    .filter((entry) => TIMELINE_NAMES.has(entry.name))
    .slice()
    .reverse();

  return (
    <JjPage
      testId="jj-timeline-view"
      title="Timeline"
      subtitle="What happened on this device this session — approvals, drafts, and Agent readiness. Nothing here was sent unless you chose an outbound action elsewhere."
      maxWidth="40rem"
    >
      {entries.length === 0 ? (
        <JjEmptyState
          testId="jj-timeline-empty"
          title="Quiet so far"
          body="Create a draft, mark something ready for review, or set Preferences to see activity here."
        />
      ) : (
        <Box
          component="ol"
          aria-label="Session timeline"
          sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}
        >
          {entries.map((entry, index) => (
            <Box
              component="li"
              key={`${entry.name}-${entry.occurredAt}-${index}`}
              sx={(theme) => ({
                px: 2,
                py: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.action.hover,
              })}
            >
              <Typography variant="body2">{entry.summary}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(entry.occurredAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </JjPage>
  );
}
