import type { JSX } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { JjEmptyState, JjPage, JjSection } from "./layout/index.js";

export type SourcesViewProps = {
  readonly onOpenCraft?: () => void;
  readonly onOpenJobMail?: () => void;
};

/**
 * Sources — discovery entry. Coming soon until adapters ship.
 */
export function SourcesView({ onOpenCraft, onOpenJobMail }: SourcesViewProps): JSX.Element {
  return (
    <JjPage
      testId="jj-sources-view"
      title="Sources"
      subtitle="Find roles from LinkedIn, boards, and company careers — coming soon. Until then, use Craft and Job Mail."
    >
      <JjSection title="Coming soon">
        <JjEmptyState
          title="Discovery stays on this device"
          body="Planned sources: LinkedIn, job boards, company careers, and All. Later, Agent can help from a Path résumé and a job description — you still own every send."
        />
        <Typography color="text.secondary" variant="body2">
          For now, paste a job description in Craft, or import job mail in Job Mail.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {onOpenCraft ? (
            <Button variant="contained" onClick={onOpenCraft} data-testid="jj-sources-open-craft">
              Open Craft
            </Button>
          ) : null}
          {onOpenJobMail ? (
            <Button
              variant="outlined"
              onClick={onOpenJobMail}
              data-testid="jj-sources-open-job-mail"
            >
              Open Job Mail
            </Button>
          ) : null}
        </Stack>
      </JjSection>
    </JjPage>
  );
}
