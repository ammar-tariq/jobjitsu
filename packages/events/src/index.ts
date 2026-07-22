/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/events" as const;

export type * from "./names.js";
export type * from "./payloads.js";
export type * from "./bus.js";

export { DURABLE_EVENT_NAMES, EVENT_NAMES } from "./names.js";
export { createInMemoryEventBus } from "./memory-bus.js";
