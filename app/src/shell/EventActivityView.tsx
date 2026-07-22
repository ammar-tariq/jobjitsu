import type { JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useHostActivity } from "./HostProvider.js";

const CASCADE = ["App.Started", "Plugin.Loaded", "Resume.Generated", "Email.Synced"] as const;

/** Calm event feed for Dojo — proves bus-driven architecture. */
export function EventActivityView(): JSX.Element {
  const activity = useHostActivity();
  const cascadeDone = CASCADE.every((name) => activity.some((entry) => entry.name === name));

  return (
    <Stack spacing={2} data-testid="jj-event-activity" sx={{ maxWidth: "40rem" }}>
      <Typography component="h2" variant="h2">
        Welcome
      </Typography>
      <Typography color="text.secondary">
        The host talks through events. This view only listens — it never calls the Agent runtime
        directly.
      </Typography>

      <Box
        component="ol"
        aria-label="Startup cascade"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {CASCADE.map((name) => {
          const hit = activity.find((entry) => entry.name === name);
          return (
            <Box
              component="li"
              key={name}
              sx={(theme) => ({
                display: "grid",
                gridTemplateColumns: "minmax(10rem, auto) 1fr",
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: hit ? theme.palette.primary.main : theme.palette.divider,
                bgcolor: hit ? theme.palette.action.selected : theme.palette.action.hover,
                opacity: hit ? 1 : 0.75,
              })}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontWeight: 500,
                  color: "primary.main",
                  fontSize: "0.875rem",
                }}
              >
                {name}
              </Typography>
              <Typography component="span" color="text.secondary" variant="body2">
                {hit?.summary ?? "Waiting…"}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography variant="body2" color="text.secondary" role="status">
        {cascadeDone ? "Startup cascade complete." : "Listening for host events…"}
      </Typography>
    </Stack>
  );
}
