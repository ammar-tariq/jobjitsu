import type { JSX } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { SHELL_NAV_ITEMS, type ShellNavId } from "../index.js";

const NAV_ICONS: Record<ShellNavId, JSX.Element> = {
  dojo: <HomeRoundedIcon fontSize="small" />,
  opportunities: <WorkOutlineRoundedIcon fontSize="small" />,
  resume: <DescriptionRoundedIcon fontSize="small" />,
  inbox: <InboxRoundedIcon fontSize="small" />,
  recruiters: <PeopleRoundedIcon fontSize="small" />,
  analytics: <AnalyticsRoundedIcon fontSize="small" />,
  extensions: <ExtensionRoundedIcon fontSize="small" />,
  settings: <SettingsRoundedIcon fontSize="small" />,
};

export type MenuContentProps = {
  readonly activeId: ShellNavId;
  readonly onSelect: (id: ShellNavId) => void;
};

/** Primary nav list — Material dashboard MenuContent pattern, JobJitsu destinations. */
export function MenuContent({ activeId, onSelect }: MenuContentProps): JSX.Element {
  return (
    <Stack
      component="nav"
      aria-label="Primary"
      sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}
    >
      <List dense sx={{ gap: 0.5, display: "flex", flexDirection: "column" }}>
        {SHELL_NAV_ITEMS.map((item) => {
          const selected = item.id === activeId;
          return (
            <ListItem key={item.id} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={selected}
                aria-current={selected ? "page" : undefined}
                onClick={() => {
                  onSelect(item.id);
                }}
              >
                <ListItemIcon>{NAV_ICONS[item.id]}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
