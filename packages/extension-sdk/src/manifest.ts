import type { ContributionPoint } from "./contributions.js";

/**
 * Declared permissions — inspected before enablement.
 * Network hosts are allowlists only; ambient net is never implied.
 */
export interface ExtensionPermission {
  readonly capability: string;
  readonly hosts?: readonly string[];
}

export interface ContributionDeclaration {
  readonly type: ContributionPoint;
  readonly id: string;
}

export interface ExtensionManifest {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  /** Semver range for JobJitsu host, e.g. `>=0.1.0`. */
  readonly enginesJobjitsu?: string;
  readonly contributes: readonly ContributionDeclaration[];
  readonly permissions?: readonly ExtensionPermission[];
}
