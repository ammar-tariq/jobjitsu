import { useEffect, useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
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

/**
 * Craft Studio — generate, export, and chat refine (PE28-S01…S03).
 * Host owns Agent; never sends.
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
          // Browser/Vite: offer a local download from the returned bytes/html.
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
    <Stack spacing={2} data-testid="jj-craft-view" sx={{ maxWidth: "48rem" }}>
      <Typography component="h2" variant="h2">
        Craft
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Paste your résumé and a job description. Agent prepares tailored drafts on this device —
        nothing is sent from here.
      </Typography>

      <TextField
        label="Your résumé"
        value={resumeText}
        onChange={(event) => setResumeText(event.target.value)}
        fullWidth
        multiline
        minRows={12}
        placeholder="Paste your current résumé…"
        slotProps={{ htmlInput: { "data-testid": "jj-craft-resume-input" } }}
      />
      <TextField
        label="Job description"
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        fullWidth
        multiline
        minRows={12}
        placeholder="Paste the job description…"
        slotProps={{ htmlInput: { "data-testid": "jj-craft-jd-input" } }}
      />
      <TextField
        label="About the company"
        value={aboutCompany}
        onChange={(event) => setAboutCompany(event.target.value)}
        fullWidth
        multiline
        minRows={3}
        placeholder="Optional"
        slotProps={{ htmlInput: { "data-testid": "jj-craft-about-company" } }}
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button
          variant="contained"
          disabled={generating || exporting || chatBusy}
          onClick={() => onGenerate("both")}
          data-testid="jj-craft-generate-both"
        >
          {generating ? "Preparing…" : "Generate both"}
        </Button>
        <Button
          variant="outlined"
          disabled={generating || exporting || chatBusy}
          onClick={() => onGenerate("resume")}
          data-testid="jj-craft-generate-resume"
        >
          Résumé draft
        </Button>
        <Button
          variant="outlined"
          disabled={generating || exporting || chatBusy}
          onClick={() => onGenerate("cover_letter")}
          data-testid="jj-craft-generate-cover"
        >
          Cover letter
        </Button>
      </Stack>

      {status ? (
        <Typography color="text.secondary" variant="body2" data-testid="jj-craft-status">
          {status}
        </Typography>
      ) : null}

      <TextField
        label="Tailored résumé draft"
        value={resumeDraft}
        onChange={(event) => setResumeDraft(event.target.value)}
        fullWidth
        multiline
        minRows={10}
        placeholder="Generated résumé draft appears here. Edit freely."
        slotProps={{ htmlInput: { "data-testid": "jj-craft-resume-draft" } }}
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          disabled={generating || exporting || chatBusy || !resumeDraft.trim()}
          onClick={() => onExport("html")}
          data-testid="jj-craft-export-html"
        >
          Save HTML
        </Button>
        <Button
          variant="contained"
          disabled={generating || exporting || chatBusy || !resumeDraft.trim()}
          onClick={() => onExport("pdf")}
          data-testid="jj-craft-export-pdf"
        >
          {exporting ? "Saving…" : "Save PDF"}
        </Button>
      </Stack>

      {previewHtml ? (
        <Stack spacing={1} data-testid="jj-craft-html-preview">
          <Typography variant="subtitle2">Résumé preview</Typography>
          <Box
            component="iframe"
            title="Résumé HTML preview"
            srcDoc={previewHtml}
            sandbox=""
            sx={{
              width: "100%",
              minHeight: "20rem",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          />
        </Stack>
      ) : null}

      <TextField
        label="Cover letter draft"
        value={coverLetterDraft}
        onChange={(event) => setCoverLetterDraft(event.target.value)}
        fullWidth
        multiline
        minRows={8}
        placeholder="Generated cover letter appears here. Edit freely."
        slotProps={{ htmlInput: { "data-testid": "jj-craft-cover-draft" } }}
      />

      <Stack spacing={1.5} data-testid="jj-craft-chat">
        <Typography variant="subtitle2">Refine with Agent</Typography>
        <Typography color="text.secondary" variant="body2">
          Ask for a focused edit. If details are thin, Agent will ask clarifying questions instead
          of inventing facts. Nothing is sent.
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={chatTarget}
          onChange={(_event, value: CraftChatTarget | null) => {
            if (value) {
              setChatTarget(value);
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
          <List dense disablePadding data-testid="jj-craft-chat-log">
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
        <TextField
          label="Ask Agent"
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          fullWidth
          multiline
          minRows={2}
          placeholder="Example: make the summary more systems-focused"
          slotProps={{ htmlInput: { "data-testid": "jj-craft-chat-input" } }}
        />
        <Button
          variant="outlined"
          disabled={generating || exporting || chatBusy || !chatInput.trim()}
          onClick={onChatSend}
          data-testid="jj-craft-chat-send"
        >
          {chatBusy ? "Thinking…" : "Ask Agent"}
        </Button>
      </Stack>
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
