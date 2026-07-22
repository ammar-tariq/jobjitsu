import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import { GuideLayout } from "../components/GuideLayout";

export default function QuickStartPage(): ReactNode {
  return (
    <GuideLayout
      title="Quick Start"
      description="Get a local checkout running and orient yourself with the docs that matter first — without re-implementing the Career OS in one sitting."
      docs={[
        {
          label: "Product vision",
          to: "/docs/product/PRODUCT_VISION",
          description: "Where the product is going.",
        },
        {
          label: "Terminology",
          to: "/docs/product/TERMINOLOGY",
          description: "Canonical product nouns before you name anything.",
        },
        {
          label: "Backlog index",
          to: "/docs/backlog/",
          description: "Epics → stories → day tasks.",
        },
        {
          label: "Vertical slices",
          to: "/docs/backlog/VERTICAL_SLICES",
          description: "One story at a time.",
        },
      ]}
    >
      <ol className="jj-steps">
        <li>
          <strong>Clone and install</strong> — follow <Link to="/installation">Installation</Link>.
        </li>
        <li>
          <strong>Run the docs site</strong>
          <CodeBlock language="bash">{`pnpm --filter @jobjitsu/website dev`}</CodeBlock>
        </li>
        <li>
          <strong>Read the spine</strong> — <Link to="/docs/product/PRODUCT_VISION">vision</Link>,{" "}
          <Link to="/docs/product/NON_GOALS">non-goals</Link>,{" "}
          <Link to="/docs/architecture/OVERVIEW">architecture overview</Link>.
        </li>
        <li>
          <strong>Pick work from the backlog</strong> — start with the implementation order and
          vertical-slice process in <Link to="/docs/backlog/">docs/backlog</Link>.
        </li>
      </ol>
      <p>
        Contributors: process expectations live in the engineering constitution and Definition of
        Done (see <Link to="/contributing">Contributing</Link>).
      </p>
    </GuideLayout>
  );
}
