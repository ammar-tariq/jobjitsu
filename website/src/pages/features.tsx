import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function FeaturesPage(): ReactNode {
  return (
    <GuideLayout
      title="Features"
      description="JobJitsu is one Career OS with a clear commitment model: Core for the v1 spine, Experimental where APIs may change, and Future for vision-accepted work."
      docs={[
        {
          label: "Features & modules",
          to: "/docs/product/FEATURES",
          description: "Full Core / Experimental / Future module map.",
        },
        {
          label: "Platform specification",
          to: "/docs/product/PLATFORM_SPECIFICATION",
          description: "Functional behavior of the OS.",
        },
        {
          label: "Terminology",
          to: "/docs/product/TERMINOLOGY",
          description: "Canonical nouns: Agent, Queue, Applications, Send.",
        },
        {
          label: "Non-goals",
          to: "/docs/product/NON_GOALS",
          description: "What JobJitsu will not become.",
        },
      ]}
    >
      <p>
        The Core spine covers identity and resume, preferences, local intelligence, the preparative
        Agent, discovery, applications, human review Queue, Send, follow-ups, timeline, and privacy
        chrome.
      </p>
      <p>
        Status chrome for on-device intelligence is <strong>Agent · On-device</strong> — see
        terminology and brand voice docs rather than raw model jargon in the UI.
      </p>
      <p>
        Pipeline intent: <code>search → curate → tailor → queue → approve → send → follow up</code>.
        The Agent prepares; you own Send.
      </p>
      <p>
        Prefer reading <Link to="/docs/product/FEATURES">Features &amp; modules</Link> for the
        authoritative table — this page only orients you.
      </p>
    </GuideLayout>
  );
}
