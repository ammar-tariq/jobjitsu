import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function RoadmapPage(): ReactNode {
  return (
    <GuideLayout
      title="Roadmap"
      description="Directional horizons for the Career OS — not a release calendar. Execution detail lives in the backlog and implementation order."
      docs={[
        {
          label: "Long-term roadmap",
          to: "/docs/product/ROADMAP",
          description: "Horizons H1–H4.",
        },
        {
          label: "Platform stories (PE*)",
          to: "/docs/roadmap/USER_STORIES",
          description: "Platform decomposition of Core work.",
        },
        {
          label: "Backlog & waves",
          to: "/docs/backlog/",
          description: "Delivery IDs, dependency graph, board.",
        },
        {
          label: "Features & status",
          to: "/docs/product/FEATURES",
          description: "Core vs Experimental vs Future commitment.",
        },
      ]}
    >
      <ul className="jj-horizon-list">
        <li>
          <strong>Horizon 1 — Application Dojo</strong> — local pipeline from search through
          follow-up.
        </li>
        <li>
          <strong>Horizon 2 — Full Hunt Loop</strong> — outcomes and deeper on-device memory.
        </li>
        <li>
          <strong>Horizon 3 — Career Craft</strong> — adjacent craft modules in the same dojo.
        </li>
        <li>
          <strong>Horizon 4 — Sovereign Ecosystem</strong> — extensibility and portability, still
          local-first.
        </li>
      </ul>
      <p>
        Authoritative narrative: <Link to="/docs/product/ROADMAP">docs/product/ROADMAP</Link>.
        Promote modules only via the admission rules in Features.
      </p>
    </GuideLayout>
  );
}
