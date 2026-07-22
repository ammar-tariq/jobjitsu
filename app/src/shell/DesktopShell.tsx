import { useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { DEFAULT_SHELL_NAV_ID, shellPageTitle, type ShellNavId } from "../index.js";
import { DRAWER_WIDTH } from "../theme/jjTheme.js";
import { ComingSoonView } from "./ComingSoonView.js";
import { EventActivityView } from "./EventActivityView.js";
import { SideMenu } from "./SideMenu.js";

/**
 * Desktop shell — Material dashboard layout (side menu + main), JobJitsu content.
 * Subscribes to host activity only; must never import `@jobjitsu/ai`.
 */
export function DesktopShell(): JSX.Element {
  const [activeId, setActiveId] = useState<ShellNavId>(DEFAULT_SHELL_NAV_ID);
  const title = shellPageTitle(activeId);

  return (
    <Box
      className="jj-shell"
      data-theme="dark"
      data-testid="jj-desktop-shell"
      sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}
    >
      <SideMenu activeId={activeId} onSelect={setActiveId} />

      <Box
        component="main"
        id="main-content"
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
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
          {activeId === "agent" ? <EventActivityView /> : <ComingSoonView title={title} />}
        </Stack>
      </Box>
    </Box>
  );
}
