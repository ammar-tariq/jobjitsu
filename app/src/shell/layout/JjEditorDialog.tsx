import type { JSX, ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type JjEditorDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly testId?: string;
  readonly titleTestId?: string;
  /** Optional footer actions (Save, Clear, …). */
  readonly actions?: ReactNode;
};

/**
 * Calm full-width editor dialog — list stays primary; create/edit opens here.
 * Does not call AI or send.
 */
export function JjEditorDialog({
  open,
  title,
  onClose,
  children,
  testId,
  titleTestId = "jj-editor-dialog-title-text",
  actions,
}: JjEditorDialogProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      transitionDuration={0}
      aria-labelledby="jj-editor-dialog-title"
      data-testid={testId}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle
        id="jj-editor-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pr: 1,
        }}
      >
        <Typography component="span" variant="subtitle1" data-testid={titleTestId}>
          {title}
        </Typography>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          size="small"
          data-testid="jj-editor-dialog-close"
        >
          <Typography component="span" aria-hidden sx={{ fontSize: "1.25rem", lineHeight: 1 }}>
            ×
          </Typography>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          {children}
          {actions ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", pt: 0.5 }}>
              {actions}
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
