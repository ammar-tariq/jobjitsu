/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/testing" as const;

export { expectErr, expectOk } from "./result.js";
export { createTestFoundation, type TestFoundation } from "./foundation.js";

export { createMemoryLogSink, createLogger } from "@jobjitsu/logger";
export { createInMemoryEventBus } from "@jobjitsu/events";
export { createMemorySettingsStore } from "@jobjitsu/config";
