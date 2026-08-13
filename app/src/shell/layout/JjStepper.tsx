import type { JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type JjStepperProps = {
  readonly steps: readonly string[];
  readonly active: number;
  readonly onSelect?: (index: number) => void;
};

/** Quiet step rail — one job at a time, no urgency. */
export function JjStepper({ steps, active, onSelect }: JjStepperProps): JSX.Element {
  return (
    <Stack
      direction="row"
      spacing={1}
      aria-label="Steps"
      sx={{ flexWrap: "wrap", alignItems: "center" }}
    >
      {steps.map((label, index) => {
        const current = index === active;
        const done = index < active;
        return (
          <Box
            key={label}
            component={onSelect ? "button" : "div"}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(index) : undefined}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              border: "none",
              background: "none",
              cursor: onSelect ? "pointer" : "default",
              color: current ? "primary.main" : "text.secondary",
              px: 0.5,
              py: 0.25,
              borderRadius: 1,
              transition: "color var(--jj-motion-duration-fast) var(--jj-motion-ease-out)",
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: "0.65rem",
                fontWeight: 600,
                bgcolor: current || done ? "primary.main" : "action.hover",
                color: current || done ? "primary.contrastText" : "text.secondary",
                transition:
                  "background-color var(--jj-motion-duration-fast) var(--jj-motion-ease-out)",
              }}
            >
              {index + 1}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: current ? 600 : 500 }}>
              {label}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
