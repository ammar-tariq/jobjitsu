import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

const PIPELINE = ["search", "curate", "tailor", "queue", "approve", "send", "follow up"] as const;

const PATHS = [
  {
    title: "Features",
    to: "/features",
    blurb: "Core modules and commitment status.",
  },
  {
    title: "Quick Start",
    to: "/quick-start",
    blurb: "Clone, install, and open the docs site.",
  },
  {
    title: "Architecture",
    to: "/architecture",
    blurb: "Local-first structure and package boundaries.",
  },
  {
    title: "Roadmap",
    to: "/roadmap",
    blurb: "Horizons for the Career OS.",
  },
] as const;

function HomepageHeader(): ReactNode {
  return (
    <header className={clsx("hero hero--jj")}>
      <div className="container hero--jj__compose">
        <p className="hero--jj__brand">JobJitsu</p>
        <Heading as="h1" className="hero__title">
          The gentle art of landing the job.
        </Heading>
        <p className="hero__subtitle">
          An open-source AI Career Operating System. Local Agent. On-device intelligence. Your
          résumé stays on your machine — nothing leaves except what you choose to send.
        </p>
        <div className="margin-top--lg hero--jj__actions">
          <Link className="button button--primary button--lg" to="/quick-start">
            Quick start
          </Link>
          <Link className="button button--outline button--lg" to="/docs/product/PRODUCT_VISION">
            Product vision
          </Link>
        </div>
        <p className="hero--jj__promises" aria-label="Brand promises">
          On-device · On-target · On your terms
        </p>
      </div>
    </header>
  );
}

function Pipeline(): ReactNode {
  return (
    <section className="jj-home-section" aria-labelledby="jj-pipeline">
      <div className="container">
        <Heading as="h2" id="jj-pipeline">
          One calm pipeline
        </Heading>
        <p className="jj-home-section__lede">
          Technique over volume — the same loop described in the product docs.
        </p>
        <ol className="jj-pipeline">
          {PIPELINE.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="jj-home-section__more">
          Detail: <Link to="/docs/product/FEATURES">Features &amp; modules</Link>
          {" · "}
          <Link to="/docs/product/PLATFORM_SPECIFICATION">Platform specification</Link>
        </p>
      </div>
    </section>
  );
}

function Paths(): ReactNode {
  return (
    <section className="jj-home-section jj-home-section--paths" aria-labelledby="jj-paths">
      <div className="container">
        <Heading as="h2" id="jj-paths">
          Explore
        </Heading>
        <ul className="jj-path-list">
          {PATHS.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>
                <span className="jj-path-list__title">{item.title}</span>
                <span className="jj-path-list__blurb">{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="jj-home-section__more">
          Full tree: <Link to="/docs/product/PRODUCT_VISION">Docs</Link>
          {" · "}
          <Link href="https://github.com/ammar-tariq/jobjitsu">GitHub</Link>
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="The gentle art of landing the job. On-device. On-target. On your terms."
    >
      <HomepageHeader />
      <main>
        <Pipeline />
        <Paths />
        <p className="jj-home-footnote container">
          {siteConfig.title} — privacy is architecture, not a settings toggle. See{" "}
          <Link to="/docs/product/NON_GOALS">non-goals</Link> and{" "}
          <Link to="/docs/brand/BRAND_GUIDELINES">brand guidelines</Link>.
        </p>
      </main>
    </Layout>
  );
}
