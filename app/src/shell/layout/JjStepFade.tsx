import type { JSX, ReactNode } from "react";
import Box from "@mui/material/Box";

export type JjStepFadeProps = {
  readonly stepKey: number | string;
  readonly children: ReactNode;
};

/** Short fade + rise between form steps. Snaps when motion is reduced. */
export function JjStepFade({ stepKey, children }: JjStepFadeProps): JSX.Element {
  return (
    <Box key={stepKey} className="jj-step-enter">
      {children}
    </Box>
  );
}
