import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

function HomepageHeader(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--jj")}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className="margin-top--lg">
          <Link
            className="button button--primary button--lg margin-right--sm"
            to="/docs/product/PRODUCT_VISION"
          >
            Read the docs
          </Link>
          <Link
            className="button button--outline button--lg"
            href="https://github.com/ammar-tariq/jobjitsu"
          >
            GitHub
          </Link>
        </div>
        <dl className="jj-promises">
          <div>
            <dt>On-device</dt>
            <dd>Local Agent · on-device intelligence</dd>
          </div>
          <div>
            <dt>On-target</dt>
            <dd>Fit and technique over spray-and-pray</dd>
          </div>
          <div>
            <dt>On your terms</dt>
            <dd>Preferences, pause, and approval before send</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Documentation" description={siteConfig.tagline}>
      <HomepageHeader />
    </Layout>
  );
}
