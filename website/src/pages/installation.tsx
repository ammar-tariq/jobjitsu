import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import { GuideLayout } from "../components/GuideLayout";

export default function InstallationPage(): ReactNode {
  return (
    <GuideLayout
      title="Installation"
      description="JobJitsu is a pnpm + Turborepo monorepo. Install once at the repository root; packages and the docs site share that workspace."
      docs={[
        {
          label: "Monorepo guide",
          to: "/docs/architecture/MONOREPO",
          description: "Repository layout and package roles.",
        },
        {
          label: "Website package README",
          to: "https://github.com/ammar-tariq/jobjitsu/blob/main/website/README.md",
          description: "Docusaurus commands for @jobjitsu/website.",
        },
        {
          label: "Desktop shell",
          to: "/docs/architecture/DESKTOP_ARCHITECTURE",
          description: "How the app shell is structured.",
        },
      ]}
    >
      <h2>Requirements</h2>
      <ul>
        <li>Node.js ≥ 20</li>
        <li>
          pnpm 9.x (pinned via the root <code>packageManager</code> field)
        </li>
      </ul>
      <h2>Install</h2>
      <CodeBlock language="bash">{`git clone https://github.com/ammar-tariq/jobjitsu.git
cd jobjitsu
pnpm install`}</CodeBlock>
      <p>
        Workspace scripts, tooling, and filters are documented in the monorepo guide linked below
        (and the root <code>MONOREPO.md</code> in the repository).
      </p>
      <h2>Documentation site</h2>
      <CodeBlock language="bash">{`pnpm --filter @jobjitsu/website dev`}</CodeBlock>
      <p>
        The site reads the existing <code>/docs</code> tree in place — it does not copy markdown.
        See also <Link to="/getting-started">Getting started</Link>.
      </p>
      <h2>Desktop UI (scaffold)</h2>
      <CodeBlock language="bash">{`pnpm --filter @jobjitsu/ui build
pnpm --filter @jobjitsu/app dev`}</CodeBlock>
      <p>
        Early foundation: brand, architecture, and monorepo scaffold are in place; domain product
        features continue through the backlog.
      </p>
    </GuideLayout>
  );
}
