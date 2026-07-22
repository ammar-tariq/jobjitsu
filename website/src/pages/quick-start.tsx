import type { ReactNode } from "react";
import { Redirect } from "@docusaurus/router";

/** @deprecated Prefer `/getting-started` — kept for existing links. */
export default function QuickStartRedirect(): ReactNode {
  return <Redirect to="/getting-started" />;
}
