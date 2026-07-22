import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function AiModelsPage(): ReactNode {
  return (
    <GuideLayout
      title="AI Models"
      description="JobJitsu’s primary intelligence path is on-device. Status chrome says Agent · On-device when the provider is local; any remote path is opt-in and labeled honestly."
      docs={[
        {
          label: "AI architecture",
          to: "/docs/architecture/AI_ARCHITECTURE",
          description: "Local intelligence path and provider boundaries.",
        },
        {
          label: "AI runtime ADR",
          to: "/docs/adr/0005-ai-runtime",
          description: "Accepted decision for the Agent runtime.",
        },
        {
          label: "Terminology",
          to: "/docs/product/TERMINOLOGY",
          description: "Agent vs model jargon in UI.",
        },
        {
          label: "Package boundaries",
          to: "/docs/architecture/PACKAGE_BOUNDARIES",
          description: "UI never calls AI; host owns providers.",
        },
      ]}
    >
      <p>
        The Agent drafts, tailors, queues, and reminds. It does not own Send. Model and embedding
        details belong in advanced settings and architecture docs — not in everyday chrome.
      </p>
      <p>
        Start with <Link to="/docs/architecture/AI_ARCHITECTURE">AI architecture</Link> for how
        local providers plug into the host.
      </p>
    </GuideLayout>
  );
}
