import type { ServiceKey } from "@jobjitsu/core";
import type { ContributionPoint, ContributionTypeMap } from "./contributions.js";
import type { ExtensionContext } from "./context.js";
import type { ExtensionManifest } from "./manifest.js";

/**
 * Lifecycle hooks — host invokes in order; extensions stay preparative.
 *
 * register (known, disabled) → enable → disable → unload
 */
export interface ExtensionLifecycle {
  /** After the extension is known to the manager (still disabled). */
  onRegister?(ctx: ExtensionContext): void | Promise<void>;
  /** After contributions are live. */
  onEnable?(ctx: ExtensionContext): void | Promise<void>;
  /** After contributions are revoked. */
  onDisable?(ctx: ExtensionContext): void | Promise<void>;
  /** Final cleanup before the extension is forgotten. */
  onUnload?(ctx: ExtensionContext): void | Promise<void>;
}

/**
 * API available while an extension enables — contribute points + scoped DI.
 */
export interface ExtensionRegistrationApi {
  readonly context: ExtensionContext;
  contribute<P extends ContributionPoint>(
    point: P,
    id: string,
    contribution: ContributionTypeMap[P],
  ): void;
  registerService<T>(key: ServiceKey<T>, value: T): void;
}

export interface ExtensionDefinition extends ExtensionLifecycle {
  readonly manifest: ExtensionManifest;
  /**
   * Called on enable — register contributions and scoped services.
   * Must not perform career egress.
   */
  register?(api: ExtensionRegistrationApi): void | Promise<void>;
}

/** Identity helper for typed extension modules. */
export function defineExtension(definition: ExtensionDefinition): ExtensionDefinition {
  return definition;
}

export type ExtensionState = "registered" | "enabled" | "disabled";

export interface ExtensionRecord {
  readonly id: string;
  readonly manifest: ExtensionManifest;
  readonly state: ExtensionState;
}
