import type { JSX } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { JjAgentPrivacyPill, type AgentPrivacyState } from "@jobjitsu/ui";
import { APP_NAME, type ShellNavId } from "../index.js";
import { DRAWER_WIDTH } from "../theme/jjTheme.js";
import { MenuContent } from "./MenuContent.js";

const Drawer = styled(MuiDrawer)({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
  },
});

export type SideMenuProps = {
  readonly activeId: ShellNavId;
  readonly onSelect: (id: ShellNavId) => void;
  /** Honest Agent chrome — unavailable until local ready. */
  readonly agentPrivacy?: AgentPrivacyState;
};

/**
 * Permanent side drawer — adapted from the Material UI dashboard SideMenu.
 * Brand + nav + privacy chrome only; no fake user card or promo alert.
 */
export function SideMenu({
  activeId,
  onSelect,
  agentPrivacy = "unavailable",
}: SideMenuProps): JSX.Element {
  return (
    <Drawer
      variant="permanent"
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          p: 1.5,
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h1" sx={{ px: 1 }}>
          {APP_NAME}
        </Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent activeId={activeId} onSelect={onSelect} />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <JjAgentPrivacyPill state={agentPrivacy} />
      </Stack>
    </Drawer>
  );
}
