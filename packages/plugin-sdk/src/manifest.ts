import type { PluginId, Result } from "@jobjitsu/core";

/**
 * Plugin SDK contracts — manifests, capabilities, fail-closed invocation.
 * Hard rule: no capability executes Send or skips approval.
 * @see docs/architecture/PLUGIN_ARCHITECTURE.md
 */

export const PLUGIN_CAPABILITIES = [
  "agent.tool",
  "ai.complete",
  "identity.read",
  "applications.read",
  "applications.write",
  "queue.enqueue",
  "network.fetch",
  "send.request",
] as const;

export type PluginCapability = (typeof PLUGIN_CAPABILITIES)[number];

/**
 * Permissions requested in the manifest (may include scoped network hosts).
 */
export interface PluginPermissionGrant {
  readonly capability: PluginCapability;
  /** Optional allowlist for `network.fetch`. */
  readonly hosts?: readonly string[];
}

export interface PluginManifest {
  readonly id: PluginId | string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  /** Semver range for JobJitsu host, e.g. `>=0.1.0`. */
  readonly enginesJobjitsu?: string;
  readonly capabilities: readonly PluginCapability[];
  readonly permissions: readonly PluginPermissionGrant[];
  /** Relative entry hint for the host loader. */
  readonly entry: string;
}

export interface PluginValidationIssue {
  readonly path: string;
  readonly message: string;
}

export interface PluginManifestValidator {
  validate(manifest: unknown): Result<PluginManifest, PluginValidationIssue[]>;
}

/** Minimum context — IDs and short excerpts only. */
export interface PluginSkillContext {
  readonly pluginId: string;
  readonly granted: readonly PluginCapability[];
  readonly applicationId?: string;
  readonly roleId?: string;
  readonly excerpts?: Readonly<Record<string, string>>;
  readonly abortSignal?: AbortSignal;
}

export interface PluginSkillResult {
  readonly ok: boolean;
  readonly message?: string;
  readonly data?: Readonly<Record<string, unknown>>;
}

export interface PluginSkill {
  readonly id: string;
  readonly manifest: PluginManifest;
  invoke(ctx: PluginSkillContext): Promise<PluginSkillResult>;
}

/**
 * Host-facing registry — enable/disable is user-controlled.
 * Disabled plugins must not run; missing caps fail closed.
 */
export interface PluginHost {
  listManifests(): Promise<readonly PluginManifest[]>;
  isEnabled(pluginId: string): Promise<boolean>;
  enable(pluginId: string): Promise<Result<void>>;
  disable(pluginId: string): Promise<Result<void>>;
  getSkill(pluginId: string): Promise<PluginSkill | undefined>;
  /** Invoke only if enabled and capabilities satisfied. */
  invoke(
    pluginId: string,
    ctx: Omit<PluginSkillContext, "pluginId" | "granted">,
  ): Promise<Result<PluginSkillResult>>;
}

/** Capabilities that must never imply direct egress success. */
export const FORBIDDEN_IMPLICIT_EGRESS_CAPS = ["send.execute", "send.succeed"] as const;
