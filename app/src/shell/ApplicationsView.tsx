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
 * Create, list, and open application drafts on-device.
 * Tailor résumé and cover letter via host Agent. Queue / follow-up stay local. Never sends.
 */
export function ApplicationsView({ bridge }: ApplicationsViewProps): JSX.Element {
  const [applications, setApplications] = useState<readonly ApplicationSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeDraftText, setResumeDraftText] = useState("");
  const [coverLetterDraftText, setCoverLetterDraftText] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [followUpDraftText, setFollowUpDraftText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [covering, setCovering] = useState(false);
  const busy = saving || tailoring || covering;
  const selected = applications.find((application) => application.id === selectedId);

  const refresh = async (): Promise<void> => {
    const result = await bridge.listApplications();
    if (result.ok) {
      setApplications(result.value.applications);
    } else {
      setStatus(result.error.message ?? result.error.title);
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
    setCoverLetterDraftText("");
    setFollowUpAt("");
    setFollowUpDraftText("");
    setDuplicateWarning(null);
  };

  const onSelect = (application: ApplicationSnapshot): void => {
    setSelectedId(application.id);
    setCompanyName(application.companyName);
    setRoleTitle(application.roleTitle);
    setSourceUrl(application.sourceUrl ?? "");
    setNotes(application.notes ?? "");
    setResumeDraftText(application.resumeDraftText ?? "");
    setCoverLetterDraftText(application.coverLetterDraftText ?? "");
    setFollowUpAt(application.followUpAt ?? "");
    setFollowUpDraftText(application.followUpDraftText ?? "");
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
          coverLetterDraftText: coverLetterDraftText.trim() || null,
          followUpAt: followUpAt.trim() || null,
          followUpDraftText: followUpDraftText.trim() || null,
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
        setCoverLetterDraftText(
          result.value.application.coverLetterDraftText ?? coverLetterDraftText,
        );
        setFollowUpAt(result.value.application.followUpAt ?? followUpAt);
        setFollowUpDraftText(result.value.application.followUpDraftText ?? followUpDraftText);
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
          setStatus("Agent is not ready yet. Choose an on-device model in Preferences.");
          return;
        }
        setStatus("Could not prepare that draft. Try again when you are ready.");
      })
      .catch(() => {
        setTailoring(false);
        setStatus("Could not prepare that draft. Try again when you are ready.");
      });
  };

  const onCoverLetterDraft = (): void => {
    if (!selectedId) {
      setStatus("Save the application draft first, then prepare a cover letter.");
      return;
    }
    setCovering(true);
    setStatus(null);
    void bridge
      .generateApplicationCoverLetter({ applicationId: selectedId })
      .then(async (result) => {
        setCovering(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        if (result.value.coverLetterStatus === "ready") {
          setCoverLetterDraftText(result.value.draftText);
          if (result.value.application) {
            setSelectedId(result.value.application.id);
          }
          setStatus("Cover letter ready. Edit freely — you remain the author. Nothing was sent.");
          await refresh();
          return;
        }
        if (result.value.coverLetterStatus === "unavailable") {
          setStatus("Agent is not ready yet. Choose an on-device model in Preferences.");
          return;
        }
        setStatus("Could not prepare that cover letter. Try again when you are ready.");
      })
      .catch(() => {
        setCovering(false);
        setStatus("Could not prepare that cover letter. Try again when you are ready.");
      });
  };

  const onReadyForReview = (): void => {
    if (!selectedId) {
      return;
    }
    setSaving(true);
    setStatus(null);
    void bridge
      .updateApplicationDraft({ id: selectedId, stage: "queue" })
      .then(async (result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus(
          "Marked ready for review. Open Queue when you want to approve. Nothing was sent.",
        );
        await refresh();
      })
      .catch(() => {
        setSaving(false);
        setStatus("Could not update that application. Try again.");
      });
  };

  const onDelete = (): void => {
    if (!selectedId) {
      return;
    }
    setSaving(true);
    setStatus(null);
    void bridge
      .deleteApplicationDraft(selectedId)
      .then(async (result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        clearForm();
        setStatus("Application removed from this device. Nothing was sent.");
        await refresh();
      })
      .catch(() => {
        setSaving(false);
        setStatus("Could not remove that application. Try again.");
      });
  };

  return (
    <Stack spacing={2} data-testid="jj-applications-view" sx={{ maxWidth: "40rem" }}>
      <Typography component="h2" variant="h2">
        Applications
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Create local application drafts, then prepare a résumé draft and cover letter on this
        device. Nothing leaves from here.
      </Typography>

      <Stack
        spacing={1.5}
        data-testid="jj-application-draft-form"
        sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      >
        <Typography variant="subtitle2" data-testid="jj-application-detail-title">
          {selectedId
            ? `Edit draft · ${selected?.trackingStatus ?? "Discovered"}`
            : "New application draft"}
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
          <>
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
            <TextField
              label="Cover letter draft"
              value={coverLetterDraftText}
              onChange={(event) => setCoverLetterDraftText(event.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={6}
              placeholder="Prepare a cover letter, then edit freely. You remain the author."
              slotProps={{ htmlInput: { "data-testid": "jj-application-cover-draft" } }}
            />
            <TextField
              label="Follow-up date"
              type="date"
              value={followUpAt}
              onChange={(event) => setFollowUpAt(event.target.value)}
              size="small"
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { "data-testid": "jj-application-followup-date" },
              }}
            />
            <TextField
              label="Follow-up note"
              value={followUpDraftText}
              onChange={(event) => setFollowUpDraftText(event.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={2}
              placeholder="Optional reminder — never sent automatically."
              slotProps={{ htmlInput: { "data-testid": "jj-application-followup-note" } }}
            />
          </>
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
            disabled={busy}
            data-testid="jj-application-save"
          >
            {selectedId ? "Save changes" : "Save draft"}
          </Button>
          {selectedId ? (
            <>
              <Button
                variant="outlined"
                onClick={onTailorDraft}
                disabled={busy}
                data-testid="jj-application-tailor"
              >
                {tailoring ? "Preparing draft…" : "Tailor draft"}
              </Button>
              <Button
                variant="outlined"
                onClick={onCoverLetterDraft}
                disabled={busy}
                data-testid="jj-application-cover-letter"
              >
                {covering ? "Preparing letter…" : "Cover letter"}
              </Button>
              <Button
                variant="outlined"
                onClick={onReadyForReview}
                disabled={busy || selected?.stage === "queue"}
                data-testid="jj-application-ready-for-review"
              >
                Ready for review
              </Button>
              <Button
                variant="text"
                color="error"
                onClick={onDelete}
                disabled={busy}
                data-testid="jj-application-delete"
              >
                Delete
              </Button>
            </>
          ) : null}
          <Button variant="text" onClick={clearForm} disabled={busy}>
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
          <Stack spacing={0.5} data-testid="jj-application-empty">
            <Typography variant="subtitle1">No applications yet</Typography>
            <Typography color="text.secondary" variant="body2">
              Add a company and role above when you are ready. Nothing leaves this device.
            </Typography>
          </Stack>
        ) : (
          <List dense disablePadding aria-label="Application drafts">
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
