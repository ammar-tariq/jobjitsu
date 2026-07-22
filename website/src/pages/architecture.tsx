import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function ArchitecturePage(): ReactNode {
  return (
    <GuideLayout
      title="Architecture Overview"
      description="JobJitsu is a local-first desktop Career OS. Intimate state stays on the machine. The Agent prepares; Send is the only career-data egress — with explicit user sovereignty."
      docs={[
        {
          label: "Architecture overview",
          to: "/docs/architecture/OVERVIEW",
          description: "Thesis, laws, and document map.",
        },
        {
          label: "System architecture",
          to: "/docs/architecture/SYSTEM_ARCHITECTURE",
          description: "C4 map, layers, runtime paths.",
        },
        {
          label: "Package boundaries",
          to: "/docs/architecture/PACKAGE_BOUNDARIES",
          description: "Ownership and forbidden edges (Agent ↛ Send).",
        },
        {
          label: "ADRs",
          to: "/docs/adr/",
          description: "Accepted technical decisions.",
        },
        {
          label: "Event system",
          to: "/docs/architecture/EVENT_SYSTEM",
          description: "Local typed domain events.",
        },
        {
          label: "AI architecture",
          to: "/docs/architecture/AI_ARCHITECTURE",
          description: "On-device intelligence path.",
        },
      ]}
    >
      <p>
        Host and shell stay calm: one primary job per view, privacy chrome with{" "}
        <strong>Agent · On-device</strong>, and deny-by-default IPC. Domain packages own identity,
        preferences, discovery, applications, queue, send, follow-ups, and timeline.
      </p>
      <p>
        Deep design lives under <Link to="/docs/architecture/OVERVIEW">docs/architecture</Link> —
        use this page only as a doorway.
      </p>
    </GuideLayout>
  );
}
