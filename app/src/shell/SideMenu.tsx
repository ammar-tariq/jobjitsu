import type { JSX } from "react";
import Box from "@mui/material/Box";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { APP_NAME, type ShellNavId } from "../index.js";
import { DRAWER_WIDTH } from "../theme/jjTheme.js";
import { COMPACT_DRAWER_WIDTH, type ShellLayout } from "./layout/index.js";
import { MenuContent } from "./MenuContent.js";

const Drawer = styled(MuiDrawer)({
  flexShrink: 0,
  boxSizing: "border-box",
});

export type SideMenuProps = {
  readonly activeId: ShellNavId;
  readonly onSelect: (id: ShellNavId) => void;
  readonly layout: ShellLayout;
};

/**
 * Permanent side drawer — nav only. Privacy chrome lives in the main status bar
 * so compact width never hides Agent · On-device.
 */
export function SideMenu({ activeId, onSelect, layout }: SideMenuProps): JSX.Element {
  const compact = layout === "compact";
  const width = compact ? COMPACT_DRAWER_WIDTH : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        [`& .${drawerClasses.paper}`]: {
          width,
          backgroundColor: "background.paper",
          overflowX: "hidden",
          transition: "width var(--jj-motion-duration-standard) var(--jj-motion-ease-in-out)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          p: compact ? 1 : 1.5,
          alignItems: "center",
          justifyContent: compact ? "center" : "flex-start",
          minHeight: 52,
        }}
      >
        <Typography
          component="h1"
          variant="h1"
          sx={{
            px: compact ? 0 : 1,
            fontSize: compact ? "0.7rem" : undefined,
            letterSpacing: compact ? "0.02em" : undefined,
            textAlign: compact ? "center" : "left",
            lineHeight: 1.2,
          }}
        >
          {APP_NAME}
        </Typography>
      </Box>
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent activeId={activeId} onSelect={onSelect} compact={compact} />
      </Box>
    </Drawer>
  );
}
