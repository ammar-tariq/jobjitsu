import { useEffect, useState, type JSX } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type {
  CraftGenerateKind,
  CraftJobPhase,
  CraftSessionSnapshot,
  ResourceSnapshotResult,
} from "../ipc/commands.js";
import { JjPage } from "./layout/index.js";

export type CraftWorkingViewProps = {
  readonly bridge: IpcBridge;
  readonly session: CraftSessionSnapshot;
  readonly elapsedSeconds: number;
};

type PhaseStep = {
  readonly phase: Exclude<CraftJobPhase, null>;
  readonly label: string;
};

function stepsForKind(kind: CraftGenerateKind | null): readonly PhaseStep[] {
  const checking: PhaseStep = { phase: "checking", label: "Checking Agent on this device" };
  const resume: PhaseStep = { phase: "resume", label: "Preparing résumé draft" };
  const cover: PhaseStep = { phase: "cover_letter", label: "Preparing cover letter" };
  if (kind === "resume") {
    return [checking, resume];
  }
  if (kind === "cover_letter") {
    return [checking, cover];
  }
  return [checking, resume, cover];
}

function phaseIndex(phase: CraftJobPhase, steps: readonly PhaseStep[]): number {
  if (!phase) {
    return -1;
  }
  return steps.findIndex((step) => step.phase === phase);
}

function summarize(
  text: string,
  emptyLabel: string,
): { readonly preview: string; readonly chars: number } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { preview: emptyLabel, chars: 0 };
  }
  const preview = trimmed.length > 220 ? `${trimmed.slice(0, 220).trimEnd()}…` : trimmed;
  return { preview, chars: trimmed.length };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB", "TB"] as const;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return `${Math.round(value)}%`;
}

/**
 * Full Craft prepare surface: what you pasted, what Agent is doing, device load.
 * Presentation only — resources via IPC; never calls AI.
 */
export function CraftWorkingView({
  bridge,
  session,
  elapsedSeconds,
}: CraftWorkingViewProps): JSX.Element {
  const [resources, setResources] = useState<ResourceSnapshotResult | null>(null);
  const job = session.job;
  const steps = stepsForKind(job.kind);
  const current = phaseIndex(job.phase, steps);
  const resume = summarize(session.resumeText, "No résumé pasted yet");
  const listing = summarize(session.jobDescription, "No job description pasted yet");
  const about = summarize(session.aboutCompany, "No company notes");

  useEffect(() => {
    let cancelled = false;
    const poll = (): void => {
      void bridge.getResources().then((result) => {
        if (cancelled || !result.ok) {
          return;
        }
        setResources(result.value.resources);
      });
    };
    poll();
    const id = setInterval(poll, 1500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [bridge]);

  const cpu = resources?.cpuPercent ?? null;
  const memoryPercent = resources?.memoryPercent ?? null;
  const memoryLabel =
    resources?.memoryUsedBytes != null && resources.memoryTotalBytes != null
      ? `${formatBytes(resources.memoryUsedBytes)} / ${formatBytes(resources.memoryTotalBytes)}`
      : "—";

  return (
    <JjPage
      testId="jj-craft-working-view"
      title="Agent is preparing"
      subtitle="Working from what you pasted below. You can leave this screen — preparation continues on this device. Nothing is sent."
      maxWidth="56rem"
    >
      <Stack
        spacing={1.25}
        data-testid="jj-craft-working-status"
        sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      >
        <Typography variant="subtitle2">
          {job.message ?? "Preparing drafts…"} · {elapsedSeconds}s
        </Typography>
        <LinearProgress aria-label="Agent preparing drafts" />
        <Typography variant="caption" color="text.secondary">
          Usually under a minute on this device, depending on your local model.
        </Typography>
      </Stack>

      <Box
        data-testid="jj-craft-working-phases"
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: `repeat(${steps.length}, 1fr)` },
        }}
      >
        {steps.map((step, index) => {
          const done = current > index;
          const active = current === index;
          return (
            <Stack
              key={step.phase}
              spacing={0.5}
              data-testid={`jj-craft-phase-${step.phase}`}
              data-active={active ? "true" : "false"}
              data-done={done ? "true" : "false"}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: active ? "primary.main" : "divider",
                bgcolor: active ? "action.selected" : "transparent",
                opacity: done || active ? 1 : 0.55,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {done ? "Done" : active ? "Now" : "Next"}
              </Typography>
              <Typography variant="body2">{step.label}</Typography>
            </Stack>
          );
        })}
      </Box>

      <Stack
        spacing={1.5}
        data-testid="jj-craft-working-inputs"
        sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      >
        <Typography variant="subtitle2">What Agent is using</Typography>
        <InputBlock
          title="Your résumé"
          preview={resume.preview}
          meta={`${resume.chars} characters`}
        />
        <InputBlock
          title="Job description"
          preview={listing.preview}
          meta={`${listing.chars} characters`}
        />
        <InputBlock
          title="About the company"
          preview={about.preview}
          meta={about.chars > 0 ? `${about.chars} characters` : "Optional"}
        />
      </Stack>

      <Stack
        spacing={1.5}
        data-testid="jj-craft-working-resources"
        sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      >
        <Typography variant="subtitle2">This device</Typography>
        <ResourceMeter
          label="Processor"
          valueLabel={formatPercent(cpu)}
          value={cpu}
          testId="jj-craft-resource-cpu"
        />
        <ResourceMeter
          label="Memory"
          valueLabel={`${formatPercent(memoryPercent)} · ${memoryLabel}`}
          value={memoryPercent}
          testId="jj-craft-resource-memory"
        />
        <Typography variant="caption" color="text.secondary" data-testid="jj-craft-resource-note">
          {resources?.message ??
            "Reading device load… Open the desktop app for live processor and memory."}
        </Typography>
      </Stack>
    </JjPage>
  );
}

function InputBlock(props: {
  readonly title: string;
  readonly preview: string;
  readonly meta: string;
}): JSX.Element {
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="body2">{props.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {props.meta}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: "6.5rem",
          overflow: "auto",
          p: 1,
          borderRadius: 1,
          bgcolor: "action.hover",
        }}
      >
        {props.preview}
      </Typography>
    </Stack>
  );
}

function ResourceMeter(props: {
  readonly label: string;
  readonly valueLabel: string;
  readonly value: number | null;
  readonly testId: string;
}): JSX.Element {
  const determinate = props.value !== null && !Number.isNaN(props.value);
  return (
    <Stack spacing={0.5} data-testid={props.testId}>
      <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
        <Typography variant="body2">{props.label}</Typography>
        <Typography variant="body2">{props.valueLabel}</Typography>
      </Stack>
      <LinearProgress
        variant={determinate ? "determinate" : "indeterminate"}
        value={determinate ? Math.min(100, Math.max(0, props.value ?? 0)) : undefined}
        aria-label={`${props.label} usage`}
      />
    </Stack>
  );
}
