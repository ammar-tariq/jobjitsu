import type { SxProps, Theme } from "@mui/material/styles";

/** Dense list row — hover wash, no card stack. */
export const jjListRowSx: SxProps<Theme> = {
  flexDirection: "column",
  alignItems: "stretch",
  gap: 1,
  py: 1.5,
  px: 1.5,
  mb: 0.5,
  borderRadius: 1,
  "&:hover": {
    bgcolor: "action.hover",
  },
};
