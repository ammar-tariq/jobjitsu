import type { JSX } from "react";
import { JobMailView } from "./JobMailView.js";

/** @deprecated Prefer JobMailView under MailboxSessionProvider. */
export function MailboxPreferences(): JSX.Element {
  return <JobMailView />;
}
