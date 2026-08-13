import type { JSX } from "react";
import type { IpcBridge } from "../ipc/bridge.js";
import { JobMailView } from "./JobMailView.js";

export type MailboxPreferencesProps = {
  readonly bridge: IpcBridge;
};

/** @deprecated Prefer JobMailView — kept as a thin alias for older call sites. */
export function MailboxPreferences({ bridge }: MailboxPreferencesProps): JSX.Element {
  return <JobMailView bridge={bridge} />;
}
