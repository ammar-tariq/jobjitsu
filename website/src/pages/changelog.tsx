import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function ChangelogPage(): ReactNode {
  return (
    <GuideLayout
      title="Changelog"
      description="Release notes ship with the open-source project. This page points at the canonical history — we do not mirror release bodies into the docs site."
      docs={[
        {
          label: "GitHub Releases",
          to: "https://github.com/ammar-tariq/jobjitsu/releases",
          description: "Tagged versions and release notes.",
        },
        {
          label: "Roadmap",
          to: "/roadmap",
          description: "Horizons and delivery direction.",
        },
        {
          label: "Implementation roadmap",
          to: "https://github.com/ammar-tariq/jobjitsu/blob/main/IMPLEMENTATION_ROADMAP.md",
          description: "Ordered waves in the repository.",
        },
      ]}
    >
      <p>
        Prefer <Link href="https://github.com/ammar-tariq/jobjitsu/releases">GitHub Releases</Link>{" "}
        for what changed in each version. Product direction lives on the{" "}
        <Link to="/roadmap">Roadmap</Link> doorway.
      </p>
    </GuideLayout>
  );
}
