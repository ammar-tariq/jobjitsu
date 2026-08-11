import { useEffect, useRef, useState, type JSX } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
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
  CraftSessionSnapshot,
} from "../ipc/commands.js";
import { useHostCraftSession } from "./HostProvider.js";

export type CraftViewProps = {
  readonly bridge: IpcBridge;
};

type DraftTab = "resume" | "cover" | "preview";

/**
 * Craft Studio — host-owned session so Agent prepare survives navigation.
 * UI shows calm progress; never calls AI directly; never sends.
 */
export function CraftView({ bridge }: CraftViewProps): JSX.Element {
  const hostSession = useHostCraftSession();
  const [session, setSession] = useState<CraftSessionSnapshot | null>(hostSession);
  const [previewHtml, setPreviewHtml] = useState("");
  const [exporting, setExporting] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [savingApplication, setSavingApplication] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [refineOpen, setRefineOpen] = useState(false);
  const [draftTab, setDraftTab] = useState<DraftTab>("resume");
  const [tick, setTick] = useState(0);
  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hostSession) {
      setSession(hostSession);
      if (!hydrated.current) {
        hydrated.current = true;
        if (hostSession.resumeDraft.trim() || hostSession.coverLetterDraft.trim()) {
          setSourcesOpen(hostSession.job.status === "running");
          setRefineOpen(true);
        }
        if (hostSession.job.status === "running") {
          setSourcesOpen(false);
        }
      }
    }
  }, [hostSession]);

  useEffect(() => {
    let cancelled = false;
    void bridge.getCraftSession().then((result) => {
      if (!cancelled && result.ok) {
        setSession(result.value.session);
        hydrated.current = true;
        if (
          result.value.session.resumeDraft.trim() ||
          result.value.session.coverLetterDraft.trim()
        ) {
          setSourcesOpen(result.value.session.job.status === "running");
          setRefineOpen(true);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const resumeText = session?.resumeText ?? "";
  const jobDescription = session?.jobDescription ?? "";
  const aboutCompany = session?.aboutCompany ?? "";
  const resumeDraft = session?.resumeDraft ?? "";
  const coverLetterDraft = session?.coverLetterDraft ?? "";
  const saveCompany = session?.saveCompany ?? "";
  const saveRole = session?.saveRole ?? "";
  const chatTarget = session?.chatTarget ?? "resume";
  const chatInput = session?.chatInput ?? "";
  const chatMessages = session?.chatMessages ?? [];
  const job = session?.job;
  const preparing = job?.status === "running";
  const hasDrafts = Boolean(resumeDraft.trim() || coverLetterDraft.trim());
  const busy = preparing || exporting || chatBusy || savingApplication;
  const status = localStatus ?? job?.message ?? null;
  const elapsedSeconds =
    preparing && job?.startedAt
      ? Math.max(1, Math.floor((Date.now() - Date.parse(job.startedAt)) / 1000))
      : 0;
  const elapsedLabel = preparing ? ` · ${elapsedSeconds + tick - tick}s` : "";

  useEffect(() => {
    if (!preparing) {
      return;
    }
    const id = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [preparing]);

  useEffect(() => {
    if (job?.status === "ready" && job.message) {
      setLocalStatus(null);
      setSourcesOpen(false);
      setRefineOpen(true);
      setDraftTab(job.kind === "cover_letter" ? "cover" : "resume");
    }
  }, [job?.status, job?.message, job?.kind]);

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

  const flushPatch = (patch: Parameters<IpcBridge["patchCraftSession"]>[0]): void => {
    if (patchTimer.current) {
      clearTimeout(patchTimer.current);
    }
    patchTimer.current = setTimeout(() => {
      void bridge.patchCraftSession(patch).then((result) => {
        if (result.ok) {
          setSession(result.value.session);
        }
      });
    }, 200);
  };

  const patchNow = (patch: Parameters<IpcBridge["patchCraftSession"]>[0]): void => {
    if (patchTimer.current) {
      clearTimeout(patchTimer.current);
      patchTimer.current = null;
    }
    void bridge.patchCraftSession(patch).then((result) => {
      if (result.ok) {
        setSession(result.value.session);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (patchTimer.current) {
        clearTimeout(patchTimer.current);
      }
    };
  }, []);

  const onGenerate = (kind: CraftGenerateKind): void => {
    setLocalStatus(null);
    patchNow({
      resumeText,
      jobDescription,
      aboutCompany,
    });
    // Small delay so patch lands before prepare reads sources — patchNow is async.
    void bridge.patchCraftSession({ resumeText, jobDescription, aboutCompany }).then((patched) => {
      if (!patched.ok) {
        setLocalStatus(patched.error.message ?? patched.error.title);
        return;
      }
      setSession(patched.value.session);
      return bridge.prepareCraftDrafts(kind).then((result) => {
        if (!result.ok) {
          setLocalStatus(result.error.message ?? result.error.title);
          return;
        }
        setSession(result.value.session);
        setSourcesOpen(false);
      });
    });
  };

  const onExport = (format: CraftExportFormat): void => {
    if (!resumeDraft.trim()) {
      setLocalStatus("Add a résumé draft before exporting.");
      return;
    }
    setExporting(true);
    setLocalStatus(null);
    void bridge
      .exportCraftResume({ draftText: resumeDraft, format, save: true })
      .then((result) => {
        setExporting(false);
        if (!result.ok) {
          setLocalStatus(result.error.message ?? result.error.title);
          return;
        }
        const value = result.value;
        if (value.html) {
          setPreviewHtml(value.html);
        }
        if (value.exportStatus === "saved") {
          setLocalStatus(value.message ?? "Saved on this device. Nothing was sent.");
          return;
        }
        if (value.exportStatus === "cancelled") {
          setLocalStatus(value.message ?? "Export cancelled. Nothing was saved.");
          return;
        }
        if (value.exportStatus === "unavailable") {
          downloadExport(value.fileName, format, value.html, value.pdfBase64);
          setLocalStatus("Download started on this device. Nothing was sent.");
          return;
        }
        if (value.exportStatus === "invalid") {
          setLocalStatus(value.message ?? "Add a résumé draft before exporting.");
          return;
        }
        setLocalStatus(value.message ?? "Could not export that draft. Try again.");
      })
      .catch(() => {
        setExporting(false);
        setLocalStatus("Could not export that draft. Try again.");
      });
  };

  const onSaveToApplication = (): void => {
    if (!resumeDraft.trim() && !coverLetterDraft.trim()) {
      setLocalStatus("Generate or paste a draft before saving to an application.");
      return;
    }
    if (!saveCompany.trim() || !saveRole.trim()) {
      setLocalStatus("Add a company and role title to save these drafts as an application.");
      return;
    }
    setSavingApplication(true);
    setLocalStatus(null);
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
          setLocalStatus(result.error.message ?? result.error.title);
          return;
        }
        setLocalStatus(
          `Saved to application “${result.value.application.companyName} · ${result.value.application.roleTitle}”. Nothing was sent.`,
        );
      })
      .catch(() => {
        setSavingApplication(false);
        setLocalStatus("Could not save that application. Try again.");
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
    setLocalStatus(null);
    patchNow({ chatInput: "", chatMessages: [...history, nextUser] });
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
          setLocalStatus(result.error.message ?? result.error.title);
          return;
        }
        const value = result.value;
        const assistantParts = [value.assistantMessage, ...value.clarifyingQuestions];
        const assistant: CraftChatMessageSnapshot = {
          role: "assistant",
          content: assistantParts.filter(Boolean).join("\n\n"),
        };
        const nextMessages = [...history, nextUser, assistant];
        patchNow({
          resumeDraft: value.resumeDraft,
          coverLetterDraft: value.coverLetterDraft,
          chatMessages: nextMessages,
          chatInput: "",
        });
        if (value.chatStatus === "clarify") {
          setLocalStatus("Agent asked a few clarifying questions. Nothing was sent.");
          return;
        }
        setLocalStatus(value.assistantMessage);
      })
      .catch(() => {
        setChatBusy(false);
        setLocalStatus("Could not refine that draft. Try again when you are ready.");
      });
  }

  return (
    <Stack spacing={2.5} data-testid="jj-craft-view" sx={{ maxWidth: "56rem", width: "100%" }}>
      <Stack spacing={0.75}>
        <Typography component="h2" variant="h2">
          Craft
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Prepare a tailored résumé and cover letter on this device. Agent keeps working if you
          leave this screen. Nothing is sent from here.
        </Typography>
      </Stack>

      {preparing ? (
        <Alert
          severity="info"
          data-testid="jj-craft-progress"
          sx={{ "& .MuiAlert-message": { width: "100%" } }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              Agent is working on this device{elapsedLabel}
            </Typography>
            <Typography variant="body2">
              {job?.message ?? "Preparing drafts… Usually under a minute, depending on your model."}
            </Typography>
            <LinearProgress aria-label="Agent preparing drafts" />
            <Typography variant="caption" color="text.secondary">
              You can leave Craft — preparation continues in the background.
            </Typography>
          </Stack>
        </Alert>
      ) : null}

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
          {hasDrafts || preparing ? (
            <Button
              size="small"
              variant="text"
              onClick={() => setSourcesOpen((open) => !open)}
              disabled={preparing}
            >
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
                onChange={(event) => {
                  const value = event.target.value;
                  setSession((prev) => (prev ? { ...prev, resumeText: value } : prev));
                  flushPatch({ resumeText: value });
                }}
                fullWidth
                multiline
                minRows={5}
                maxRows={12}
                disabled={preparing}
                placeholder="Paste your current résumé…"
                slotProps={{ htmlInput: { "data-testid": "jj-craft-resume-input" } }}
              />
              <TextField
                label="Job description"
                value={jobDescription}
                onChange={(event) => {
                  const value = event.target.value;
                  setSession((prev) => (prev ? { ...prev, jobDescription: value } : prev));
                  flushPatch({ jobDescription: value });
                }}
                fullWidth
                multiline
                minRows={5}
                maxRows={12}
                disabled={preparing}
                placeholder="Paste the job description…"
                slotProps={{ htmlInput: { "data-testid": "jj-craft-jd-input" } }}
              />
            </Box>
            <TextField
              label="About the company"
              value={aboutCompany}
              onChange={(event) => {
                const value = event.target.value;
                setSession((prev) => (prev ? { ...prev, aboutCompany: value } : prev));
                flushPatch({ aboutCompany: value });
              }}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              disabled={preparing}
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
                {preparing ? "Preparing…" : "Prepare drafts"}
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

        {!sourcesOpen && (hasDrafts || preparing) ? (
          <Typography color="text.secondary" variant="body2">
            {preparing
              ? "Sources are locked while Agent prepares drafts."
              : "Sources are tucked away so you can focus on the draft."}
          </Typography>
        ) : null}
      </Stack>

      {status && !preparing ? (
        <Typography
          color="text.secondary"
          variant="body2"
          role="status"
          data-testid="jj-craft-status"
        >
          {status}
        </Typography>
      ) : null}
      {preparing ? (
        <Typography
          color="text.secondary"
          variant="body2"
          role="status"
          data-testid="jj-craft-status"
          sx={{ display: "none" }}
        >
          {job?.message}
        </Typography>
      ) : null}

      {hasDrafts || preparing ? (
        <Stack spacing={1.5} data-testid="jj-craft-workspace">
          <Tabs
            value={draftTab}
            onChange={(_event, value: DraftTab) => {
              setDraftTab(value);
              if (value === "resume" || value === "cover") {
                const target = value === "cover" ? "cover_letter" : "resume";
                setSession((prev) => (prev ? { ...prev, chatTarget: target } : prev));
                flushPatch({ chatTarget: target });
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
              onChange={(event) => {
                const value = event.target.value;
                setSession((prev) => (prev ? { ...prev, resumeDraft: value } : prev));
                flushPatch({ resumeDraft: value });
              }}
              fullWidth
              multiline
              minRows={14}
              maxRows={24}
              disabled={preparing}
              placeholder={
                preparing
                  ? "Agent is preparing your résumé draft…"
                  : "Generated résumé draft appears here. Edit freely."
              }
              slotProps={{ htmlInput: { "data-testid": "jj-craft-resume-draft" } }}
            />
          </Box>

          <Box hidden={draftTab !== "cover"}>
            <TextField
              label="Cover letter draft"
              value={coverLetterDraft}
              onChange={(event) => {
                const value = event.target.value;
                setSession((prev) => (prev ? { ...prev, coverLetterDraft: value } : prev));
                flushPatch({ coverLetterDraft: value });
              }}
              fullWidth
              multiline
              minRows={14}
              maxRows={24}
              disabled={preparing}
              placeholder={
                preparing
                  ? "Agent is preparing your cover letter…"
                  : "Generated cover letter appears here. Edit freely."
              }
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
                    setSession((prev) => (prev ? { ...prev, chatTarget: value } : prev));
                    flushPatch({ chatTarget: value });
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
                  onChange={(event) => {
                    const value = event.target.value;
                    setSession((prev) => (prev ? { ...prev, chatInput: value } : prev));
                    flushPatch({ chatInput: value });
                  }}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  disabled={preparing}
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
                onChange={(event) => {
                  const value = event.target.value;
                  setSession((prev) => (prev ? { ...prev, saveCompany: value } : prev));
                  flushPatch({ saveCompany: value });
                }}
                size="small"
                fullWidth
                disabled={preparing}
                slotProps={{ htmlInput: { "data-testid": "jj-craft-save-company" } }}
              />
              <TextField
                label="Role title"
                value={saveRole}
                onChange={(event) => {
                  const value = event.target.value;
                  setSession((prev) => (prev ? { ...prev, saveRole: value } : prev));
                  flushPatch({ saveRole: value });
                }}
                size="small"
                fullWidth
                disabled={preparing}
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
