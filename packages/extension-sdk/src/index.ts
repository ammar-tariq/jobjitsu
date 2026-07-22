/** Package identity. */
export const PACKAGE_NAME = "@jobjitsu/extension-sdk" as const;

export type {
  AgentSkillContribution,
  ContributionPoint,
  ContributionRecord,
  ContributionTypeMap,
  DiscoverySourceContribution,
  SchedulerJobTypeContribution,
  SendChannelContribution,
  TimelineExporterContribution,
  UiPanelContribution,
  UiStatusContribution,
} from "./contributions.js";
export { CONTRIBUTION_POINTS, isContributionPoint } from "./contributions.js";

export type {
  ContributionDeclaration,
  ExtensionManifest,
  ExtensionPermission,
} from "./manifest.js";

export type { ExtensionContext } from "./context.js";
export { createExtensionContext, createScopedServiceRegistry } from "./context.js";

export type {
  ExtensionDefinition,
  ExtensionLifecycle,
  ExtensionRecord,
  ExtensionRegistrationApi,
  ExtensionState,
} from "./lifecycle.js";
export { defineExtension } from "./lifecycle.js";

export type { ContributeFn, CreateExtensionManagerOptions, ExtensionManager } from "./manager.js";
export { ExtensionServiceKeys, createExtensionManager } from "./manager.js";
