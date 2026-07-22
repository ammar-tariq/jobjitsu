/**
 * Host contribution points — type-safe registration surface.
 * @see docs/architecture/EXTENSION_SYSTEM.md
 *
 * No concrete discovery/send/UI implementations here — markers only.
 */

export const CONTRIBUTION_POINTS = [
  "discovery.source",
  "send.channel",
  "agent.skill",
  "ui.panel",
  "ui.status",
  "timeline.exporter",
  "scheduler.jobType",
] as const;

export type ContributionPoint = (typeof CONTRIBUTION_POINTS)[number];

export function isContributionPoint(value: string): value is ContributionPoint {
  return (CONTRIBUTION_POINTS as readonly string[]).includes(value);
}

/** Marker contributions — hosts/extensions fill these later; SDK stays free of product code. */

export type DiscoverySourceContribution = {
  readonly kind: "discovery.source";
  readonly label: string;
};

export type SendChannelContribution = {
  readonly kind: "send.channel";
  readonly label: string;
  /** Channel still must go through Send policy — never raw egress. */
  readonly requiresApproval: true;
};

export type AgentSkillContribution = {
  readonly kind: "agent.skill";
  readonly skillId: string;
};

export type UiPanelContribution = {
  readonly kind: "ui.panel";
  readonly title: string;
};

export type UiStatusContribution = {
  readonly kind: "ui.status";
  readonly label: string;
};

export type TimelineExporterContribution = {
  readonly kind: "timeline.exporter";
  readonly label: string;
};

export type SchedulerJobTypeContribution = {
  readonly kind: "scheduler.jobType";
  readonly jobType: string;
};

export interface ContributionTypeMap {
  readonly "discovery.source": DiscoverySourceContribution;
  readonly "send.channel": SendChannelContribution;
  readonly "agent.skill": AgentSkillContribution;
  readonly "ui.panel": UiPanelContribution;
  readonly "ui.status": UiStatusContribution;
  readonly "timeline.exporter": TimelineExporterContribution;
  readonly "scheduler.jobType": SchedulerJobTypeContribution;
}

export interface ContributionRecord<P extends ContributionPoint = ContributionPoint> {
  readonly point: P;
  readonly id: string;
  readonly extensionId: string;
  readonly contribution: ContributionTypeMap[P];
}
