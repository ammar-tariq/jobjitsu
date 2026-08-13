import type { JSX } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { SHELL_NAV_GROUPS, type ShellNavId } from "../index.js";

const NAV_ICONS: Record<ShellNavId, JSX.Element> = {
  craft: <EditNoteRoundedIcon fontSize="small" />,
  applications: <WorkOutlineRoundedIcon fontSize="small" />,
  queue: <InboxRoundedIcon fontSize="small" />,
  "follow-ups": <EventAvailableRoundedIcon fontSize="small" />,
  profile: <PersonOutlineRoundedIcon fontSize="small" />,
  "job-mail": <MailOutlineRoundedIcon fontSize="small" />,
  sources: <TravelExploreRoundedIcon fontSize="small" />,
  agent: <SupportAgentRoundedIcon fontSize="small" />,
  preferences: <TuneRoundedIcon fontSize="small" />,
  timeline: <HistoryRoundedIcon fontSize="small" />,
};

export type MenuContentProps = {
  readonly activeId: ShellNavId;
  readonly onSelect: (id: ShellNavId) => void;
  readonly compact?: boolean;
};

/** Grouped primary nav — Work / You / System per SHELL_IA. */
export function MenuContent({
  activeId,
  onSelect,
  compact = false,
}: MenuContentProps): JSX.Element {
  return (
    <Stack
      component="nav"
      aria-label="Primary"
      spacing={compact ? 1 : 1.5}
      sx={{ flexGrow: 1, p: compact ? 0.5 : 1 }}
    >
      {SHELL_NAV_GROUPS.map((group) => (
        <Stack key={group.id} spacing={0.25}>
          {compact ? null : (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 2, pt: 0.5, letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              {group.label}
            </Typography>
          )}
          <List dense sx={{ gap: 0.25, display: "flex", flexDirection: "column" }}>
            {group.items.map((item) => {
              const selected = item.id === activeId;
              const button = (
                <ListItemButton
                  selected={selected}
                  aria-current={selected ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() => {
                    onSelect(item.id);
                  }}
                  sx={(theme) => ({
                    justifyContent: compact ? "center" : "flex-start",
                    px: compact ? 1 : 2,
                    "&.Mui-focusVisible": {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: compact ? 0 : 36, justifyContent: "center" }}>
                    {NAV_ICONS[item.id]}
                  </ListItemIcon>
                  {compact ? null : <ListItemText primary={item.label} />}
                </ListItemButton>
              );
              return (
                <ListItem key={item.id} disablePadding sx={{ display: "block" }}>
                  {compact ? (
                    <Tooltip title={item.label} placement="right">
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  )}
                </ListItem>
              );
            })}
          </List>
        </Stack>
      ))}
    </Stack>
  );
}
