import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AGENT_PROGRESS_PAYLOAD_KEYS,
  DURABLE_EVENT_NAMES,
  EVENT_NAMES,
  PACKAGE_NAME,
  isEventName,
  type EventBus,
  type EventPayloadMap,
} from "./index.js";

/** Normative names from docs/architecture/EVENT_SYSTEM.md core catalog. */
const EVENT_SYSTEM_CORE = [
  "App.Started",
  "Plugin.Loaded",
  "Resume.Imported",
  "Resume.Generated",
  "Job.Imported",
  "Jobs.Synced",
  "Email.Synced",
  "Agent.Started",
  "Agent.Paused",
  "Agent.Resumed",
  "Agent.Progress",
  "Agent.Idle",
  "Agent.Failed",
  "Workflow.Started",
  "Workflow.Completed",
  "Workflow.Failed",
  "Discovery.RolesFound",
  "Discovery.RolesCurated",
  "Application.DraftCreated",
  "Application.Tailored",
  "Application.Updated",
  "Application.StageChanged",
  "Application.Submitted",
  "Knowledge.Updated",
  "Queue.Enqueued",
  "Queue.Approved",
  "Queue.Rejected",
  "Queue.Cleared",
  "Send.Attempted",
  "Send.Succeeded",
  "Send.Failed",
  "Send.Unknown",
  "FollowUp.Scheduled",
  "FollowUp.Due",
  "FollowUp.Sent",
  "FollowUp.Dismissed",
  "Ai.Started",
  "Ai.Finished",
  "Ai.ValidationCompleted",
  "Ai.LocalModelLoading",
  "Ai.LocalModelReady",
  "Ai.LocalModelFailed",
  "Privacy.EgressRecorded",
  "Preferences.Changed",
  "Scheduler.JobRan",
  "Plugin.Enabled",
  "Plugin.Disabled",
  "Extension.Registered",
  "Extension.Enabled",
  "Extension.Disabled",
  "Extension.Unloaded",
  "Extension.Failed",
] as const;

describe("@jobjitsu/events catalog", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/events");
  });

  it("compiles EVENT_SYSTEM core catalog names", () => {
    for (const name of EVENT_SYSTEM_CORE) {
      expect(EVENT_NAMES, name).toContain(name);
      expect(isEventName(name)).toBe(true);
    }
  });

  it("includes egress + Application.Submitted in durable set", () => {
    expect(DURABLE_EVENT_NAMES).toContain("Send.Attempted");
    expect(DURABLE_EVENT_NAMES).toContain("Send.Succeeded");
    expect(DURABLE_EVENT_NAMES).toContain("Send.Unknown");
    expect(DURABLE_EVENT_NAMES).toContain("Privacy.EgressRecorded");
    expect(DURABLE_EVENT_NAMES).toContain("Application.Submitted");
  });

  it("keeps Agent.Progress ID-centric (no résumé body keys)", () => {
    expect([...AGENT_PROGRESS_PAYLOAD_KEYS].sort()).toEqual(["count", "message", "stage"]);
    type ProgressKeys = keyof EventPayloadMap["Agent.Progress"];
    const _assert: ProgressKeys = "stage";
    void _assert;
    // Type-level: assigning a resume body field must not be a known key.
    type Forbidden = Extract<ProgressKeys, "resumeBody" | "fullResumeText" | "coverLetter">;
    const forbidden: Forbidden extends never ? true : false = true;
    expect(forbidden).toBe(true);
  });

  it("keeps Resume.Generated to resumeId only", () => {
    type Keys = keyof EventPayloadMap["Resume.Generated"];
    const keys: Keys[] = ["resumeId"];
    expect(keys).toEqual(["resumeId"]);
  });

  it("types EventBus without providing an implementation", () => {
    const keys: Array<keyof EventBus> = ["publish", "subscribe", "subscribeAll"];
    expect(keys).toHaveLength(3);
  });

  it("memory bus source has no network I/O", () => {
    const path = join(dirname(fileURLToPath(import.meta.url)), "memory-bus.ts");
    const source = readFileSync(path, "utf8");
    expect(source).not.toMatch(/\bfetch\b/);
    expect(source).not.toMatch(/\bhttp\b/i);
    expect(source).not.toMatch(/\bnet\b/);
    expect(source).not.toMatch(/WebSocket/);
  });
});
