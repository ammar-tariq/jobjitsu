import { createMemorySettingsStore } from "@jobjitsu/config";
import {
  FoundationKeys,
  createErrorReporter,
  createServiceRegistry,
  type ServiceRegistry,
} from "@jobjitsu/core";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createLogger, createMemoryLogSink } from "@jobjitsu/logger";
import type { LogRecord } from "@jobjitsu/logger";

export type TestFoundation = {
  readonly registry: ServiceRegistry;
  readonly records: readonly LogRecord[];
};

/**
 * Boots a minimal foundation registry for unit tests.
 * No AI services registered.
 */
export function createTestFoundation(): TestFoundation {
  const sink = createMemoryLogSink();
  const logger = createLogger(sink);
  const registry = createServiceRegistry();
  const bus = createInMemoryEventBus();
  const settings = createMemorySettingsStore();
  const errors = createErrorReporter({ logger });

  registry.register(FoundationKeys.logger, logger);
  registry.register(FoundationKeys.eventBus, bus);
  registry.register(FoundationKeys.settingsStore, settings);
  registry.register(FoundationKeys.errorReporter, errors);

  return {
    registry,
    get records() {
      return sink.records;
    },
  };
}
