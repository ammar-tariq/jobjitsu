import { useEffect, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type {
  ApplicationSnapshot,
  MailboxDashboardSnapshot,
  MailboxEmailSnapshot,
  MailboxTimelineSnapshot,
} from "../ipc/commands.js";
import { JjEditorDialog, JjEmptyState, JjPage, JjSurface } from "./layout/index.js";

const APPLICATION_FILTERS = [
  ["all", "All"],
  ["active", "Active"],
  ["awaiting", "Awaiting response"],
  ["assessment", "Assessment"],
  ["interview", "Interview"],
  ["offer", "Offer"],
  ["rejected", "Rejected"],
  ["archived", "Archived"],
] as const;

export type ApplicationsViewProps = {
  readonly bridge: IpcBridge;
  readonly onOpenPreferences?: () => void;
};

/**
 * List applications on-device; New draft / row open the editor dialog.
 * Tailor résumé and cover letter via host Agent. Never sends.
 */
export function ApplicationsView({
  bridge,
  onOpenPreferences,
}: ApplicationsViewProps): JSX.Element {
  const [applications, setApplications] = useState<readonly ApplicationSnapshot[]>([]);
  const [dashboard, setDashboard] = useState<MailboxDashboardSnapshot | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [timeline, setTimeline] = useState<readonly MailboxTimelineSnapshot[]>([]);
  const [emails, setEmails] = useState<readonly MailboxEmailSnapshot[]>([]);
  const [openEmail, setOpenEmail] = useState<MailboxEmailSnapshot | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
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
    const dash = await bridge.getMailboxDashboard();
    if (dash.ok) {
      setDashboard(dash.value.dashboard);
    }
  };

  useEffect(() => {
    void refresh();
  }, [bridge]);

  const resetFormFields = (): void => {
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
    setTimeline([]);
    setEmails([]);
    setOpenEmail(null);
  };

  const openNewDraft = (): void => {
    resetFormFields();
    setStatus(null);
    setEditorOpen(true);
  };

  const closeEditor = (): void => {
    setEditorOpen(false);
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
    setOpenEmail(null);
    setEditorOpen(true);
    void bridge.listApplicationTimeline(application.id).then((result) => {
      if (result.ok) {
        setTimeline(result.value.events);
      }
    });
    void bridge.listApplicationEmails(application.id).then((result) => {
      if (result.ok) {
        setEmails(result.value.emails);
      }
    });
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
        resetFormFields();
        setEditorOpen(false);
        setStatus("Application removed from this device. Nothing was sent.");
        await refresh();
      })
      .catch(() => {
        setSaving(false);
        setStatus("Could not remove that application. Try again.");
      });
  };

  const visible = applications.filter((application) => {
    if (filter !== "archived" && application.archived) {
      return false;
    }
    const lifecycle = (application.lifecycleStatus ?? "").toLowerCase();
    if (filter === "active") {
      if (lifecycle === "rejected" || lifecycle === "withdrawn" || lifecycle === "accepted") {
        return false;
      }
    } else if (filter === "awaiting") {
      if (lifecycle !== "applied" && lifecycle !== "no_response") {
        return false;
      }
    } else if (filter === "assessment") {
      if (!lifecycle.includes("assessment")) {
        return false;
      }
    } else if (filter === "interview") {
      if (!lifecycle.includes("interview")) {
        return false;
      }
    } else if (filter === "offer") {
      if (lifecycle !== "offer_received" && lifecycle !== "accepted") {
        return false;
      }
    } else if (filter === "rejected") {
      if (lifecycle !== "rejected") {
        return false;
      }
    } else if (filter === "archived") {
      if (!application.archived) {
        return false;
      }
    }
    const haystack = `${application.companyName} ${application.roleTitle}`.toLowerCase();
    return query.trim().length === 0 || haystack.includes(query.trim().toLowerCase());
  });

  const editorTitle = selectedId
    ? `Edit draft · ${selected?.trackingStatus ?? "Discovered"}`
    : "New application draft";

  return (
    <JjPage
      testId="jj-applications-view"
      title="Applications"
      subtitle="Create local drafts, or connect Gmail in Job Mail to import job mail. Nothing leaves from here."
      maxWidth="44rem"
      action={
        <Button
          variant="contained"
          size="small"
          onClick={openNewDraft}
          disabled={busy}
          data-testid="jj-application-new-draft"
        >
          New draft
        </Button>
      }
    >
      {dashboard ? <ApplicationSummary dashboard={dashboard} /> : null}

      {dashboard && dashboard.actions.length > 0 ? (
        <JjSurface testId="jj-application-attention" spacing={1}>
          <Typography variant="subtitle2">Needs your attention</Typography>
          {dashboard.actions.map((action) => (
            <Stack
              key={action.id}
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <Typography variant="body2">
                {action.priority === "high" ? "Due soon · " : ""}
                {action.description}
                {action.dueAt ? ` · ${action.dueAt.slice(0, 10)}` : ""}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  void bridge.completeMailboxAction(action.id).then(() => refresh());
                }}
              >
                Mark done
              </Button>
            </Stack>
          ))}
        </JjSurface>
      ) : null}

      {dashboard && dashboard.duplicates.length > 0 ? (
        <JjSurface testId="jj-application-duplicates" spacing={1}>
          <Typography variant="subtitle2">Possible duplicate applications</Typography>
          {dashboard.duplicates.map((pair) => (
            <Stack
              key={`${pair.leftId}-${pair.rightId}`}
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", alignItems: "center" }}
            >
              <Typography variant="body2">
                {pair.companyName}: {pair.leftRole} / {pair.rightRole}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  void bridge.mergeApplications(pair.leftId, pair.rightId).then(() => refresh());
                }}
              >
                Merge
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  void bridge
                    .dismissDuplicateApplications(pair.leftId, pair.rightId)
                    .then(() => refresh());
                }}
              >
                Keep separate
              </Button>
            </Stack>
          ))}
        </JjSurface>
      ) : null}

      <JjSurface testId="jj-application-list" spacing={1.25}>
        <TextField
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          size="small"
          placeholder="Company or role"
          fullWidth
        />
        <Tabs
          value={filter}
          onChange={(_event, value: string) => setFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Application filters"
          sx={{ minHeight: 36, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {APPLICATION_FILTERS.map(([id, label]) => (
            <Tab key={id} value={id} label={label} />
          ))}
        </Tabs>
        {visible.length === 0 ? (
          <JjEmptyState
            testId="jj-application-empty"
            title="No applications yet"
            body="Add a company and role when you are ready, or connect Gmail to import job mail. Nothing leaves this device."
            action={
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={openNewDraft}
                  data-testid="jj-application-empty-new-draft"
                >
                  New draft
                </Button>
                {onOpenPreferences ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={onOpenPreferences}
                    data-testid="jj-application-connect-gmail"
                  >
                    Connect Gmail
                  </Button>
                ) : null}
              </Stack>
            }
          />
        ) : (
          <List dense disablePadding aria-label="Application drafts">
            {visible.map((application) => (
              <ListItemButton
                key={application.id}
                selected={editorOpen && selectedId === application.id}
                onClick={() => onSelect(application)}
                data-testid={`jj-application-row-${application.id}`}
                sx={{ borderRadius: 1, mb: 0.25 }}
              >
                <ListItemText
                  primary={`${application.companyName} · ${application.roleTitle}`}
                  secondary={`${application.lifecycleLabel ?? application.trackingStatus}${
                    application.lastActivityAt
                      ? ` · ${application.lastActivityAt.slice(0, 10)}`
                      : ""
                  }`}
                  slotProps={{
                    primary: { noWrap: true },
                    secondary: { noWrap: true },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </JjSurface>

      {!editorOpen && status ? (
        <Typography
          color="text.secondary"
          variant="body2"
          role="status"
          data-testid="jj-application-status"
        >
          {status}
        </Typography>
      ) : null}

      <JjEditorDialog
        open={editorOpen}
        title={editorTitle}
        titleTestId="jj-application-detail-title"
        onClose={closeEditor}
        testId="jj-application-draft-dialog"
        actions={
          <>
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
              </>
            ) : null}
            <Button
              variant="text"
              onClick={() => {
                resetFormFields();
                setStatus(null);
              }}
              disabled={busy}
            >
              Clear
            </Button>
            {selectedId ? (
              <Button
                variant="text"
                color="error"
                onClick={onDelete}
                disabled={busy}
                data-testid="jj-application-delete"
              >
                Delete
              </Button>
            ) : null}
          </>
        }
      >
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

        {selectedId ? (
          <Stack spacing={1} data-testid="jj-application-intelligence">
            {selected?.lifecycleLabel ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip size="small" label={selected.lifecycleLabel} />
              </Stack>
            ) : null}
            {selected?.nextAction ? (
              <Typography variant="body2">Next · {selected.nextAction}</Typography>
            ) : null}
            {selected?.recruiterEmail ? (
              <Typography variant="body2">
                Recruiter · {selected.recruiterName ?? selected.recruiterEmail}
              </Typography>
            ) : null}
            <Button
              size="small"
              sx={{ alignSelf: "flex-start" }}
              onClick={() => {
                void bridge.archiveApplication(selectedId).then(() => {
                  resetFormFields();
                  setEditorOpen(false);
                  void refresh();
                });
              }}
            >
              Archive
            </Button>
            {timeline.length > 0 ? (
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Timeline</Typography>
                {timeline.map((event) => (
                  <Stack
                    key={event.id}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Typography variant="body2">
                      {event.at.slice(0, 10)} · {event.summary}
                    </Typography>
                    {event.emailId ? (
                      <Button
                        size="small"
                        onClick={() => {
                          void bridge.getMailboxEmail(event.emailId ?? "").then((result) => {
                            if (result.ok) {
                              setOpenEmail(result.value.email);
                            }
                          });
                        }}
                      >
                        View email
                      </Button>
                    ) : null}
                  </Stack>
                ))}
              </Stack>
            ) : null}
            {emails.length > 0 ? (
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Emails</Typography>
                {emails.map((email) => (
                  <Typography key={email.id} variant="body2">
                    {email.subject} · {email.senderEmail}
                  </Typography>
                ))}
              </Stack>
            ) : null}
            {openEmail ? (
              <Alert
                severity="info"
                onClose={() => setOpenEmail(null)}
                data-testid="jj-application-source-email"
              >
                <Typography variant="subtitle2">{openEmail.subject}</Typography>
                <Typography variant="body2">{openEmail.snippet}</Typography>
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        {status ? (
          <Typography
            color="text.secondary"
            variant="body2"
            role="status"
            data-testid="jj-application-status"
          >
            {status}
          </Typography>
        ) : null}
      </JjEditorDialog>
    </JjPage>
  );
}

function ApplicationSummary({
  dashboard,
}: {
  readonly dashboard: MailboxDashboardSnapshot;
}): JSX.Element {
  const { summary, funnel, analytics } = dashboard;
  return (
    <Stack spacing={0.5} data-testid="jj-application-dashboard">
      <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {summary.totalApplications} applications · {summary.activeApplications} active ·{" "}
        {summary.interviews} interviews · {summary.assessments} assessments · {summary.offers}{" "}
        offers
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Funnel · Applied {funnel.applied} → Responses {funnel.responses} → Interviews{" "}
        {funnel.interviews} → Offers {funnel.offers}
      </Typography>
      {analytics.applications > 0 ? (
        <Typography color="text.secondary" variant="body2">
          Last {analytics.windowDays} days · {analytics.applications} applications ·{" "}
          {analytics.responseRate}% heard back · {analytics.interviewRate}% interviews ·{" "}
          {analytics.offerRate}% offers
        </Typography>
      ) : null}
    </Stack>
  );
}
