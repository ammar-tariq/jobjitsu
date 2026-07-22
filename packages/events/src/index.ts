/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/events" as const;

export type * from "./names.js";
export type * from "./payloads.js";
export type * from "./bus.js";

export { DURABLE_EVENT_NAMES, EVENT_NAMES, isEventName } from "./names.js";
export {
  DURABLE_ALLOWLIST_REQUIREMENTS,
  durableAllowlistCoversRequirements,
  isDurableEventName,
} from "./durable-allowlist.js";
export { AGENT_PROGRESS_PAYLOAD_KEYS } from "./payloads.js";
export { createInMemoryEventBus } from "./memory-bus.js";
export {
  createMemoryDurableEventSink,
  type MemoryDurableEventSink,
} from "./memory-durable-sink.js";
