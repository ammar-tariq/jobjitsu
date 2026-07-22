import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import { GuideLayout } from "../components/GuideLayout";

export default function GettingStartedPage(): ReactNode {
  return (
    <GuideLayout
      title="Getting Started"
      description="Clone the monorepo, run the docs site, and orient on the product spine — without rushing into feature code."
      docs={[
        {
          label: "Installation",
          to: "/installation",
          description: "Toolchain and workspace setup.",
        },
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
          label: "Features",
          to: "/features",
          description: "Capability doorway into product docs.",
        },
        {
          label: "Backlog index",
          to: "/docs/backlog/",
          description: "Epics → stories → day tasks.",
        },
      ]}
    >
      <ol className="jj-steps">
        <li>
          <strong>Install</strong> — follow <Link to="/installation">Installation</Link> for Node,
          pnpm, and a local checkout.
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
