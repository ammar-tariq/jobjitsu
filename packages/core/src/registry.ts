import type { SettingsStore } from "@jobjitsu/config";
import type { EventBus } from "@jobjitsu/events";
import type { Logger } from "@jobjitsu/logger";
import type { ErrorReporter } from "./error-reporter.js";

/**
 * Tiny typed service registry — composition root helper.
 * No AI tokens; host registers foundation services only.
 */

export type ServiceKey<T> = symbol & { readonly __service?: T };

export function createServiceKey<T>(description: string): ServiceKey<T> {
  return Symbol(description) as ServiceKey<T>;
}

export interface ServiceRegistry {
  register<T>(key: ServiceKey<T>, value: T): void;
  resolve<T>(key: ServiceKey<T>): T;
  tryResolve<T>(key: ServiceKey<T>): T | undefined;
  has(key: ServiceKey<unknown>): boolean;
}

export function createServiceRegistry(): ServiceRegistry {
  const map = new Map<symbol, unknown>();

  return {
    register(key, value) {
      map.set(key, value);
    },
    resolve(key) {
      if (!map.has(key)) {
        throw new Error(`Service not registered: ${key.description}`);
      }
      return map.get(key) as never;
    },
    tryResolve(key) {
      return map.get(key) as never;
    },
    has(key) {
      return map.has(key);
    },
  };
}

/** Well-known foundation keys — host may register these at boot. */
export const FoundationKeys = {
  logger: createServiceKey<Logger>("jobjitsu.logger"),
  errorReporter: createServiceKey<ErrorReporter>("jobjitsu.errorReporter"),
  eventBus: createServiceKey<EventBus>("jobjitsu.eventBus"),
  settingsStore: createServiceKey<SettingsStore>("jobjitsu.settingsStore"),
} as const;
