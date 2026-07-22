/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/send" as const;

export type * from "./channel.js";
export type { FakeGmailChannel, FakeGmailMessage } from "./fake-gmail.js";
export { createFakeGmailChannel } from "./fake-gmail.js";
