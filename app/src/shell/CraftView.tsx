import { useEffect, useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type {
  CraftChatMessageSnapshot,
  CraftChatTarget,
  CraftExportFormat,
  CraftGenerateKind,
} from "../ipc/commands.js";

export type CraftViewProps = {
  readonly bridge: IpcBridge;
};

type DraftTab = "resume" | "cover" | "preview";

/**
 * Craft Studio — paste sources, prepare drafts, refine, export.
 * One job at a time; host owns Agent; never sends.
 */
export function CraftView({ bridge }: CraftViewProps): JSX.Element {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [resumeDraft, setResumeDraft] = useState("");
  const [coverLetterDraft, setCoverLetterDraft] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatTarget, setChatTarget] = useState<CraftChatTarget>("resume");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<readonly CraftChatMessageSnapshot[]>([]);
  const [savingApplication, setSavingApplication] = useState(false);
  const [saveCompany, setSaveCompany] = useState("");
  const [saveRole, setSaveRole] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [refineOpen, setRefineOpen] = useState(false);
  const [draftTab, setDraftTab] = useState<DraftTab>("resume");

  const hasDrafts = Boolean(resumeDraft.trim() || coverLetterDraft.trim());
  const busy = generating || exporting || chatBusy || savingApplication;

  useEffect(() => {
    if (!resumeDraft.trim()) {
      setPreviewHtml("");
      return;
    }
    let cancelled = false;
    void bridge.exportCraftResume({ draftText: resumeDraft, format: "html" }).then((result) => {
      if (cancelled || !result.ok || result.value.exportStatus === "invalid") {
        return;
      }
      setPreviewHtml(result.value.html);
    });
    return () => {
      cancelled = true;
    };
  }, [bridge, resumeDraft]);

  const onGenerate = (kind: CraftGenerateKind): void => {
    setGenerating(true);
    setStatus(null);
    void bridge
      .generateCraftDrafts({
        kind,
        resumeText,
        jobDescription,
        aboutCompany: aboutCompany.trim() || undefined,
      })
      .then((result) => {
        setGenerating(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        const value = result.value;
        if (value.craftStatus === "ready") {
          if (kind === "resume" || kind === "both") {
            setResumeDraft(value.resumeDraft);
          }
          if (kind === "cover_letter" || kind === "both") {
            setCoverLetterDraft(value.coverLetterDraft);
          }
          setSourcesOpen(false);
          setRefineOpen(true);
          setDraftTab(kind === "cover_letter" ? "cover" : "resume");
          setChatTarget(kind === "cover_letter" ? "cover_letter" : "resume");
          setStatus("Drafts ready. Edit freely — you remain the author. Nothing was sent.");
          return;
        }
        if (value.craftStatus === "unavailable") {
          setStatus(
            value.message ??
              "Agent is not ready yet. Check Preferences for the on-device model name.",
          );
          return;
        }
        if (value.craftStatus === "invalid") {
          setStatus(value.message ?? "Add your résumé and job description before generating.");
          return;
        }
        setStatus(value.message ?? "Could not prepare those drafts. Try again when you are ready.");
      })
      .catch(() => {
        setGenerating(false);
        setStatus("Could not prepare those drafts. Try again when you are ready.");
      });
  };

  const onExport = (format: CraftExportFormat): void => {
    if (!resumeDraft.trim()) {
      setStatus("Add a résumé draft before exporting.");
      return;
    }
    setExporting(true);
    setStatus(null);
    void bridge
      .exportCraftResume({ draftText: resumeDraft, format, save: true })
      .then((result) => {
        setExporting(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        const value = result.value;
        if (value.html) {
          setPreviewHtml(value.html);
        }
        if (value.exportStatus === "saved") {
          setStatus(value.message ?? "Saved on this device. Nothing was sent.");
          return;
        }
        if (value.exportStatus === "cancelled") {
          setStatus(value.message ?? "Export cancelled. Nothing was saved.");
          return;
        }
        if (value.exportStatus === "unavailable") {
          downloadExport(value.fileName, format, value.html, value.pdfBase64);
          setStatus("Download started on this device. Nothing was sent.");
          return;
        }
        if (value.exportStatus === "invalid") {
          setStatus(value.message ?? "Add a résumé draft before exporting.");
          return;
        }
        setStatus(value.message ?? "Could not export that draft. Try again.");
      })
      .catch(() => {
        setExporting(false);
        setStatus("Could not export that draft. Try again.");
      });
  };

  const onSaveToApplication = (): void => {
    if (!resumeDraft.trim() && !coverLetterDraft.trim()) {
      setStatus("Generate or paste a draft before saving to an application.");
      return;
    }
    if (!saveCompany.trim() || !saveRole.trim()) {
      setStatus("Add a company and role title to save these drafts as an application.");
      return;
    }
    setSavingApplication(true);
    setStatus(null);
    void bridge
      .createApplicationDraft({
        companyName: saveCompany.trim(),
        roleTitle: saveRole.trim(),
        resumeDraftText: resumeDraft.trim() || undefined,
        coverLetterDraftText: coverLetterDraft.trim() || undefined,
        notes: aboutCompany.trim() || undefined,
      })
      .then((result) => {
        setSavingApplication(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus(
          `Saved to application “${result.value.application.companyName} · ${result.value.application.roleTitle}”. Nothing was sent.`,
        );
      })
      .catch(() => {
        setSavingApplication(false);
        setStatus("Could not save that application. Try again.");
      });
  };

  function onChatSend(): void {
    const message = chatInput.trim();
    if (!message) {
      return;
    }
    const history = chatMessages;
    const nextUser: CraftChatMessageSnapshot = { role: "user", content: message };
    setChatBusy(true);
    setStatus(null);
    setChatInput("");
    setChatMessages([...history, nextUser]);
    void bridge
      .refineCraftChat({
        message,
        target: chatTarget,
        resumeText,
        jobDescription,
        aboutCompany: aboutCompany.trim() || undefined,
        resumeDraft,
        coverLetterDraft,
        history,
      })
      .then((result) => {
        setChatBusy(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        const value = result.value;
        setResumeDraft(value.resumeDraft);
        setCoverLetterDraft(value.coverLetterDraft);
        const assistantParts = [value.assistantMessage, ...value.clarifyingQuestions];
        const assistant: CraftChatMessageSnapshot = {
          role: "assistant",
          content: assistantParts.filter(Boolean).join("\n\n"),
        };
        setChatMessages((prev) => [...prev, assistant]);
        if (value.chatStatus === "clarify") {
          setStatus("Agent asked a few clarifying questions. Nothing was sent.");
          return;
        }
        if (value.chatStatus === "reply") {
          setStatus(value.assistantMessage);
          return;
        }
        if (value.chatStatus === "unavailable") {
          setStatus(value.assistantMessage);
          return;
        }
        setStatus(value.assistantMessage);
      })
      .catch(() => {
        setChatBusy(false);
        setStatus("Could not refine that draft. Try again when you are ready.");
      });
  }

  return (
    <Stack spacing={2.5} data-testid="jj-craft-view" sx={{ maxWidth: "56rem", width: "100%" }}>
      <Stack spacing={0.75}>
        <Typography component="h2" variant="h2">
          Craft
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Prepare a tailored résumé and cover letter on this device. Nothing is sent from here.
        </Typography>
      </Stack>

      <Stack
        spacing={1.5}
        sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        data-testid="jj-craft-sources"
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <Typography variant="subtitle2">Sources</Typography>
          {hasDrafts ? (
            <Button size="small" variant="text" onClick={() => setSourcesOpen((open) => !open)}>
              {sourcesOpen ? "Hide sources" : "Edit sources"}
            </Button>
          ) : null}
        </Stack>

        <Collapse in={sourcesOpen} timeout="auto" unmountOnExit={false}>
          <Stack spacing={1.5}>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <TextField
                label="Your résumé"
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                fullWidth
                multiline
                minRows={5}
                maxRows={12}
                placeholder="Paste your current résumé…"
                slotProps={{ htmlInput: { "data-testid": "jj-craft-resume-input" } }}
              />
              <TextField
                label="Job description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                fullWidth
                multiline
                minRows={5}
                maxRows={12}
                placeholder="Paste the job description…"
                slotProps={{ htmlInput: { "data-testid": "jj-craft-jd-input" } }}
              />
            </Box>
            <TextField
              label="About the company"
              value={aboutCompany}
              onChange={(event) => setAboutCompany(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="Optional context"
              slotProps={{ htmlInput: { "data-testid": "jj-craft-about-company" } }}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <Button
                variant="contained"
                disabled={busy}
                onClick={() => onGenerate("both")}
                data-testid="jj-craft-generate-both"
              >
                {generating ? "Preparing…" : "Prepare drafts"}
              </Button>
              <Button
                variant="text"
                disabled={busy}
                onClick={() => onGenerate("resume")}
                data-testid="jj-craft-generate-resume"
              >
                Résumé only
              </Button>
              <Button
                variant="text"
                disabled={busy}
                onClick={() => onGenerate("cover_letter")}
                data-testid="jj-craft-generate-cover"
              >
                Cover letter only
              </Button>
            </Stack>
          </Stack>
        </Collapse>

        {!sourcesOpen && hasDrafts ? (
          <Typography color="text.secondary" variant="body2">
            Sources are tucked away so you can focus on the draft.
          </Typography>
        ) : null}
      </Stack>

      {status ? (
        <Typography
          color="text.secondary"
          variant="body2"
          role="status"
          data-testid="jj-craft-status"
        >
          {status}
        </Typography>
      ) : null}

      {hasDrafts ? (
        <Stack spacing={1.5} data-testid="jj-craft-workspace">
          <Tabs
            value={draftTab}
            onChange={(_event, value: DraftTab) => {
              setDraftTab(value);
              if (value === "resume" || value === "cover") {
                setChatTarget(value === "cover" ? "cover_letter" : "resume");
              }
            }}
            aria-label="Craft drafts"
          >
            <Tab label="Résumé" value="resume" data-testid="jj-craft-tab-resume" />
            <Tab label="Cover letter" value="cover" data-testid="jj-craft-tab-cover" />
            <Tab
              label="Preview"
              value="preview"
              disabled={!resumeDraft.trim()}
              data-testid="jj-craft-tab-preview"
            />
          </Tabs>

          <Box hidden={draftTab !== "resume"}>
            <TextField
              label="Résumé draft"
              value={resumeDraft}
              onChange={(event) => setResumeDraft(event.target.value)}
              fullWidth
              multiline
              minRows={14}
              maxRows={24}
              placeholder="Generated résumé draft appears here. Edit freely."
              slotProps={{ htmlInput: { "data-testid": "jj-craft-resume-draft" } }}
            />
          </Box>

          <Box hidden={draftTab !== "cover"}>
            <TextField
              label="Cover letter draft"
              value={coverLetterDraft}
              onChange={(event) => setCoverLetterDraft(event.target.value)}
              fullWidth
              multiline
              minRows={14}
              maxRows={24}
              placeholder="Generated cover letter appears here. Edit freely."
              slotProps={{ htmlInput: { "data-testid": "jj-craft-cover-draft" } }}
            />
          </Box>

          <Box hidden={draftTab !== "preview"} data-testid="jj-craft-html-preview">
            {previewHtml ? (
              <Box
                component="iframe"
                title="Résumé HTML preview"
                srcDoc={previewHtml}
                sandbox=""
                sx={{
                  width: "100%",
                  minHeight: "24rem",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              />
            ) : (
              <Typography color="text.secondary" variant="body2">
                Preview appears when a résumé draft is ready.
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button
              variant="contained"
              disabled={busy || !resumeDraft.trim()}
              onClick={() => onExport("pdf")}
              data-testid="jj-craft-export-pdf"
            >
              {exporting ? "Saving…" : "Save PDF"}
            </Button>
            <Button
              variant="outlined"
              disabled={busy || !resumeDraft.trim()}
              onClick={() => onExport("html")}
              data-testid="jj-craft-export-html"
            >
              Save HTML
            </Button>
            <Button
              variant="text"
              disabled={busy}
              onClick={() => setRefineOpen((open) => !open)}
              data-testid="jj-craft-refine-toggle"
            >
              {refineOpen ? "Hide refine" : "Refine with Agent"}
            </Button>
          </Stack>

          <Collapse in={refineOpen} timeout="auto">
            <Stack
              spacing={1.5}
              data-testid="jj-craft-chat"
              sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
            >
              <Typography variant="subtitle2">Refine with Agent</Typography>
              <Typography color="text.secondary" variant="body2">
                Ask for a focused edit. If details are thin, Agent asks clarifying questions instead
                of inventing facts.
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={chatTarget}
                onChange={(_event, value: CraftChatTarget | null) => {
                  if (value) {
                    setChatTarget(value);
                    setDraftTab(value === "cover_letter" ? "cover" : "resume");
                  }
                }}
                aria-label="Draft to refine"
              >
                <ToggleButton value="resume" data-testid="jj-craft-chat-target-resume">
                  Résumé
                </ToggleButton>
                <ToggleButton value="cover_letter" data-testid="jj-craft-chat-target-cover">
                  Cover letter
                </ToggleButton>
              </ToggleButtonGroup>
              {chatMessages.length > 0 ? (
                <List
                  dense
                  disablePadding
                  data-testid="jj-craft-chat-log"
                  sx={{ maxHeight: "12rem", overflow: "auto" }}
                >
                  {chatMessages.map((entry, index) => (
                    <ListItem key={`${entry.role}-${index}`} alignItems="flex-start" disableGutters>
                      <ListItemText
                        primary={entry.role === "user" ? "You" : "Agent"}
                        secondary={entry.content}
                        sx={{ "& .MuiListItemText-secondary": { whiteSpace: "pre-wrap" } }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : null}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ alignItems: "flex-end" }}
              >
                <TextField
                  label="Ask Agent"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  placeholder="Example: make the summary more systems-focused"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      onChatSend();
                    }
                  }}
                  slotProps={{ htmlInput: { "data-testid": "jj-craft-chat-input" } }}
                />
                <Button
                  variant="outlined"
                  disabled={busy || !chatInput.trim()}
                  onClick={onChatSend}
                  data-testid="jj-craft-chat-send"
                  sx={{ flexShrink: 0 }}
                >
                  {chatBusy ? "Thinking…" : "Ask Agent"}
                </Button>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                ⌘/Ctrl + Enter to send
              </Typography>
            </Stack>
          </Collapse>

          <Stack
            spacing={1.5}
            data-testid="jj-craft-save-application"
            sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
          >
            <Typography variant="subtitle2">Keep as an application</Typography>
            <Typography color="text.secondary" variant="body2">
              Save these drafts on this device. Nothing is sent.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Company"
                value={saveCompany}
                onChange={(event) => setSaveCompany(event.target.value)}
                size="small"
                fullWidth
                slotProps={{ htmlInput: { "data-testid": "jj-craft-save-company" } }}
              />
              <TextField
                label="Role title"
                value={saveRole}
                onChange={(event) => setSaveRole(event.target.value)}
                size="small"
                fullWidth
                slotProps={{ htmlInput: { "data-testid": "jj-craft-save-role" } }}
              />
              <Button
                variant="outlined"
                disabled={busy || (!resumeDraft.trim() && !coverLetterDraft.trim())}
                onClick={onSaveToApplication}
                data-testid="jj-craft-save-application-btn"
                sx={{ flexShrink: 0 }}
              >
                {savingApplication ? "Saving…" : "Save"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="body2" data-testid="jj-craft-empty">
          Paste a résumé and job description above, then prepare drafts when you are ready.
        </Typography>
      )}
    </Stack>
  );
}

function downloadExport(
  fileName: string,
  format: CraftExportFormat,
  html: string,
  pdfBase64: string,
): void {
  if (typeof document === "undefined") {
    return;
  }
  const anchor = document.createElement("a");
  anchor.download = fileName || (format === "pdf" ? "resume.pdf" : "resume.html");
  if (format === "html") {
    anchor.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  } else {
    const binary = atob(pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    anchor.href = URL.createObjectURL(new Blob([bytes.buffer], { type: "application/pdf" }));
  }
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
