import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function ContributingPage(): ReactNode {
  return (
    <GuideLayout
      title="Contributing"
      description="Contributions should stay calm, inspectable, and aligned with privacy and human-owned Send. Process lives in the engineering docs — not duplicated here."
      docs={[
        {
          label: "Engineering constitution",
          to: "https://github.com/ammar-tariq/jobjitsu/blob/main/ENGINEERING_CONSTITUTION.md",
          description: "How software is built on JobJitsu.",
        },
        {
          label: "Definition of Done",
          to: "https://github.com/ammar-tariq/jobjitsu/blob/main/DEFINITION_OF_DONE.md",
          description: "Documented, tested, typed, reviewed, lint, build.",
        },
        {
          label: "Vertical slices",
          to: "/docs/backlog/VERTICAL_SLICES",
          description: "One user story at a time.",
        },
        {
          label: "Brand for development",
          to: "/docs/brand/BRANDING_FOR_DEVELOPMENT",
          description: "Agent language, on-device chrome, no pressure UX.",
        },
        {
          label: "Testing strategy",
          to: "/docs/architecture/TESTING_STRATEGY",
          description: "Privacy and approval-gate must-covers.",
        },
        {
          label: "Backlog",
          to: "/docs/backlog/",
          description: "Pick admitted work; respect dependency waves.",
        },
      ]}
    >
      <ol className="jj-steps">
        <li>
          Read <Link to="/docs/product/TERMINOLOGY">terminology</Link> and{" "}
          <Link to="/docs/product/NON_GOALS">non-goals</Link>.
        </li>
        <li>Prefer Core · H1 backlog items with dependencies satisfied.</li>
        <li>
          Keep Agent preparative paths separate from{" "}
          <Link to="/docs/architecture/PACKAGE_BOUNDARIES">Send</Link>.
        </li>
        <li>Meet the Definition of Done before opening a PR.</li>
        <li>
          Doc changes on <code>main</code> publish automatically via GitHub Actions (build, link
          check, Pages) — no separate docs release process.
        </li>
      </ol>
      <p>
        The website stays <strong>documentation-first</strong> (contributors and users), not a
        marketing site. Discuss on{" "}
        <Link href="https://github.com/ammar-tariq/jobjitsu/issues">GitHub Issues</Link>. Source:{" "}
        <Link href="https://github.com/ammar-tariq/jobjitsu">ammar-tariq/jobjitsu</Link>.
      </p>
    </GuideLayout>
  );
}
