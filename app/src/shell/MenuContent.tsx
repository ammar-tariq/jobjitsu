import type { JSX } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { SHELL_NAV_ITEMS, type ShellNavId } from "../index.js";

const NAV_ICONS: Record<ShellNavId, JSX.Element> = {
  applications: <WorkOutlineRoundedIcon fontSize="small" />,
  queue: <InboxRoundedIcon fontSize="small" />,
  "follow-ups": <EventAvailableRoundedIcon fontSize="small" />,
  profile: <PersonOutlineRoundedIcon fontSize="small" />,
  agent: <SupportAgentRoundedIcon fontSize="small" />,
  preferences: <TuneRoundedIcon fontSize="small" />,
  timeline: <HistoryRoundedIcon fontSize="small" />,
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
                sx={(theme) => ({
                  "&.Mui-focusVisible": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                })}
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
