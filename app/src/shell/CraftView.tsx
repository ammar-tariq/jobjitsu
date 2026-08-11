import { useState, type JSX } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { CraftGenerateKind } from "../ipc/commands.js";

export type CraftViewProps = {
  readonly bridge: IpcBridge;
};

/**
 * Craft Studio — résumé + JD (+ optional about company) → editable drafts (PE28-S01).
 * Host owns Agent; never sends.
 */
export function CraftView({ bridge }: CraftViewProps): JSX.Element {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [resumeDraft, setResumeDraft] = useState("");
  const [coverLetterDraft, setCoverLetterDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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
          disabled={generating}
          onClick={() => onGenerate("both")}
          data-testid="jj-craft-generate-both"
        >
          {generating ? "Preparing…" : "Generate both"}
        </Button>
        <Button
          variant="outlined"
          disabled={generating}
          onClick={() => onGenerate("resume")}
          data-testid="jj-craft-generate-resume"
        >
          Résumé draft
        </Button>
        <Button
          variant="outlined"
          disabled={generating}
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
    </Stack>
  );
}
