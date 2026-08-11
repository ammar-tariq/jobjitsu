import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import type { HostActivityEntry, HostRuntime } from "../host/runtime.js";
import type { CraftSessionSnapshot } from "../ipc/commands.js";
import type { CraftSessionState } from "../host/craft-session.js";

export type HostUiContextValue = {
  readonly activity: readonly HostActivityEntry[];
  readonly craftSession: CraftSessionSnapshot;
};

const HostUiContext = createContext<HostUiContextValue | null>(null);

function toSnapshot(session: CraftSessionState): CraftSessionSnapshot {
  return {
    resumeText: session.resumeText,
    jobDescription: session.jobDescription,
    aboutCompany: session.aboutCompany,
    resumeDraft: session.resumeDraft,
    coverLetterDraft: session.coverLetterDraft,
    saveCompany: session.saveCompany,
    saveRole: session.saveRole,
    chatTarget: session.chatTarget,
    chatInput: session.chatInput,
    chatMessages: session.chatMessages.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    job: {
      status: session.job.status,
      phase: session.job.phase,
      kind: session.job.kind,
      message: session.job.message,
      startedAt: session.job.startedAt,
    },
  };
}

/**
 * UI-facing host bridge — activity + craft session subscriptions only.
 * Deliberately does not expose AiProvider.
 */
export function HostProvider(props: {
  readonly runtime: HostRuntime;
  readonly children: ReactNode;
}): JSX.Element {
  const [activity, setActivity] = useState<readonly HostActivityEntry[]>(
    props.runtime.getActivity(),
  );
  const [craftSession, setCraftSession] = useState<CraftSessionSnapshot>(() =>
    toSnapshot(props.runtime.getCraftSession()),
  );

  useEffect(() => {
    return props.runtime.subscribeActivity(setActivity);
  }, [props.runtime]);

  useEffect(() => {
    return props.runtime.subscribeCraftSession((session) => {
      setCraftSession(toSnapshot(session));
    });
  }, [props.runtime]);

  return (
    <HostUiContext.Provider value={{ activity, craftSession }}>
      {props.children}
    </HostUiContext.Provider>
  );
}

export function useHostActivity(): readonly HostActivityEntry[] {
  const ctx = useContext(HostUiContext);
  if (!ctx) {
    throw new Error("useHostActivity requires HostProvider");
  }
  return ctx.activity;
}

export function useHostCraftSession(): CraftSessionSnapshot {
  const ctx = useContext(HostUiContext);
  if (!ctx) {
    throw new Error("useHostCraftSession requires HostProvider");
  }
  return ctx.craftSession;
}
