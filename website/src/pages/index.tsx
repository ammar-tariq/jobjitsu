import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import { JjHero } from "../components/JjHero";
import { JjFeatureCards } from "../components/JjFeatureCards";

const PIPELINE = ["search", "curate", "tailor", "queue", "approve", "send", "follow up"] as const;

const PATHS = [
  {
    title: "Getting Started",
    to: "/getting-started",
    blurb: "Clone, install, and orient on the docs spine.",
  },
  {
    title: "Architecture",
    to: "/architecture",
    blurb: "Local-first structure and package boundaries.",
  },
  {
    title: "AI Models",
    to: "/ai-models",
    blurb: "On-device Agent path and provider honesty.",
  },
  {
    title: "Plugins",
    to: "/plugins",
    blurb: "Capability-gated agent skills.",
  },
  {
    title: "Roadmap",
    to: "/roadmap",
    blurb: "Horizons for the Career OS.",
  },
  {
    title: "FAQ",
    to: "/faq",
    blurb: "Short answers with links into the docs.",
  },
] as const;

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
    <section
      className={clsx("jj-home-section", "jj-home-section--paths")}
      aria-labelledby="jj-paths"
    >
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
      title="JobJitsu"
      description="JobJitsu — open-source AI Career Operating System. Local-first. On-device Agent. Optional readonly Gmail import. You own send."
    >
      <JjHero />
      <main>
        <section className="jj-home-section" aria-labelledby="jj-purpose">
          <div className="container">
            <Heading as="h2" id="jj-purpose">
              What JobJitsu does
            </Heading>
            <p className="jj-home-section__lede">
              JobJitsu is a desktop companion for a calmer job search — not a job board and not a
              cloud résumé vault.
            </p>
            <ul className="jj-purpose-list">
              <li>
                <strong>Prepare applications on your device</strong> — tailor résumé and
                cover-letter drafts with an on-device Agent.
              </li>
              <li>
                <strong>Track applications locally</strong> — queue, follow-ups, and timeline stay
                on this machine.
              </li>
              <li>
                <strong>Optional email import</strong> — connect Gmail or Outlook with readonly
                OAuth so JobJitsu can surface job-related mail. JobJitsu never asks for your mailbox
                password and does not send mail through that connection.
              </li>
              <li>
                <strong>You own send</strong> — nothing leaves the device for apply or follow-up
                unless you approve it.
              </li>
            </ul>
            <p className="jj-home-section__more">
              Privacy: <Link to="/privacy">Privacy Policy</Link>
              {" · "}
              Terms: <Link to="/terms">Terms of Service</Link>
              {" · "}
              Source: <Link href="https://github.com/ammar-tariq/jobjitsu">GitHub</Link>
            </p>
          </div>
        </section>
        <JjFeatureCards />
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
