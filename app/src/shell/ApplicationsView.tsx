import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { ApplicationSnapshot } from "../ipc/commands.js";

export type ApplicationsViewProps = {
  readonly bridge: IpcBridge;
};

/**
 * Create and edit application drafts on-device (PE08-S01).
 * Tailor résumé draft via host Agent (PE03-S04). Soft-duplicate warns; never sends.
 */
export function ApplicationsView({ bridge }: ApplicationsViewProps): JSX.Element {
  const [applications, setApplications] = useState<readonly ApplicationSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeDraftText, setResumeDraftText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tailoring, setTailoring] = useState(false);

  const refresh = async (): Promise<void> => {
    const result = await bridge.listApplications();
    if (result.ok) {
      setApplications(result.value.applications);
    }
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const clearForm = (): void => {
    setSelectedId(null);
    setCompanyName("");
    setRoleTitle("");
    setSourceUrl("");
    setNotes("");
    setResumeDraftText("");
    setDuplicateWarning(null);
  };

  const onSelect = (application: ApplicationSnapshot): void => {
    setSelectedId(application.id);
    setCompanyName(application.companyName);
    setRoleTitle(application.roleTitle);
    setSourceUrl(application.sourceUrl ?? "");
    setNotes(application.notes ?? "");
    setResumeDraftText(application.resumeDraftText ?? "");
    setDuplicateWarning(null);
    setStatus(null);
  };

  const onSave = (): void => {
    if (companyName.trim().length === 0 || roleTitle.trim().length === 0) {
      setStatus("Add a company and role title before saving.");
      return;
    }
    setSaving(true);
    setStatus(null);
    setDuplicateWarning(null);

    const request = selectedId
      ? bridge.updateApplicationDraft({
          id: selectedId,
          companyName: companyName.trim(),
          roleTitle: roleTitle.trim(),
          sourceUrl: sourceUrl.trim() || null,
          notes: notes.trim() || null,
          resumeDraftText: resumeDraftText.trim() || null,
        })
      : bridge.createApplicationDraft({
          companyName: companyName.trim(),
          roleTitle: roleTitle.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        });

    void request
      .then(async (result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setDuplicateWarning(result.value.duplicateWarning?.message ?? null);
        setSelectedId(result.value.application.id);
        setResumeDraftText(result.value.application.resumeDraftText ?? resumeDraftText);
        setStatus(
          selectedId
            ? "Application draft updated. Nothing was sent."
            : "Application draft saved. Nothing was sent.",
        );
        await refresh();
      })
      .catch(() => {
        setSaving(false);
        setStatus("Something went wrong saving that draft. Try again.");
      });
  };

  const onTailorDraft = (): void => {
    if (!selectedId) {
      setStatus("Save the application draft first, then tailor a résumé draft.");
      return;
    }
    setTailoring(true);
    setStatus(null);
    void bridge
      .tailorApplicationDraft({ applicationId: selectedId })
      .then(async (result) => {
        setTailoring(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        if (result.value.tailorStatus === "ready") {
          setResumeDraftText(result.value.draftText);
          if (result.value.application) {
            setSelectedId(result.value.application.id);
          }
          setStatus("Draft ready. Edit freely — you remain the author. Nothing was sent.");
          await refresh();
          return;
        }
        if (result.value.tailorStatus === "unavailable") {
          setStatus("Agent is not ready yet. Check Preferences for the on-device model path.");
          return;
        }
        setStatus("Could not prepare that draft. Try again when you are ready.");
      })
      .catch(() => {
        setTailoring(false);
        setStatus("Could not prepare that draft. Try again when you are ready.");
      });
  };

  return (
    <Stack spacing={2} data-testid="jj-applications-view" sx={{ maxWidth: "40rem" }}>
      <Typography component="h2" variant="h2">
        Applications
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Create local application drafts and tailor a résumé draft on this device. Nothing leaves
        from here.
      </Typography>

      <Stack
        spacing={1.5}
        data-testid="jj-application-draft-form"
        sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      >
        <Typography variant="subtitle2">
          {selectedId ? "Edit draft" : "New application draft"}
        </Typography>
        <TextField
          label="Company"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { "data-testid": "jj-application-company" } }}
        />
        <TextField
          label="Role title"
          value={roleTitle}
          onChange={(event) => setRoleTitle(event.target.value)}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { "data-testid": "jj-application-role" } }}
        />
        <TextField
          label="Source URL"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          size="small"
          fullWidth
          placeholder="Optional"
          slotProps={{ htmlInput: { "data-testid": "jj-application-source-url" } }}
        />
        <TextField
          label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          size="small"
          fullWidth
          multiline
          minRows={2}
          placeholder="Optional"
          slotProps={{ htmlInput: { "data-testid": "jj-application-notes" } }}
        />
        {selectedId ? (
          <TextField
            label="Résumé draft"
            value={resumeDraftText}
            onChange={(event) => setResumeDraftText(event.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={6}
            placeholder="Tailor a draft, then edit freely. You remain the author."
            slotProps={{ htmlInput: { "data-testid": "jj-application-resume-draft" } }}
          />
        ) : null}
        {duplicateWarning ? (
          <Alert severity="info" data-testid="jj-application-duplicate-warn">
            {duplicateWarning}
          </Alert>
        ) : null}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saving || tailoring}
            data-testid="jj-application-save"
          >
            {selectedId ? "Save changes" : "Save draft"}
          </Button>
          {selectedId ? (
            <Button
              variant="outlined"
              onClick={onTailorDraft}
              disabled={saving || tailoring}
              data-testid="jj-application-tailor"
            >
              {tailoring ? "Preparing draft…" : "Tailor draft"}
            </Button>
          ) : null}
          <Button variant="text" onClick={clearForm} disabled={saving || tailoring}>
            Clear
          </Button>
        </Stack>
      </Stack>

      {status ? (
        <Typography color="text.secondary" variant="body2" data-testid="jj-application-status">
          {status}
        </Typography>
      ) : null}

      <Stack spacing={1} data-testid="jj-application-list">
        <Typography variant="subtitle2">Drafts on this device</Typography>
        {applications.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No application drafts yet. Add a company and role when you are ready.
          </Typography>
        ) : (
          <List dense disablePadding>
            {applications.map((application) => (
              <ListItemButton
                key={application.id}
                selected={selectedId === application.id}
                onClick={() => onSelect(application)}
                data-testid={`jj-application-row-${application.id}`}
              >
                <ListItemText
                  primary={`${application.companyName} · ${application.roleTitle}`}
                  secondary={application.trackingStatus}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Stack>
    </Stack>
  );
}
