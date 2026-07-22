import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

export type DocRef = {
  label: string;
  to: string;
  description: string;
};

type GuideLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  docs: DocRef[];
};

/**
 * Thin guide page chrome — short intro + links into `/docs` (no duplicated content).
 */
export function GuideLayout({ title, description, children, docs }: GuideLayoutProps): ReactNode {
  return (
    <Layout title={title} description={description}>
      <main className="jj-guide">
        <div className="container jj-guide__inner">
          <header className="jj-guide__header">
            <Heading as="h1">{title}</Heading>
            <p className="jj-guide__lede">{description}</p>
          </header>
          <div className="jj-guide__body">{children}</div>
          <section className="jj-guide__docs" aria-labelledby="jj-guide-docs">
            <Heading as="h2" id="jj-guide-docs">
              Read in the docs
            </Heading>
            <ul className="jj-doc-list">
              {docs.map((doc) => (
                <li key={doc.to}>
                  <Link to={doc.to}>
                    <span className="jj-doc-list__label">{doc.label}</span>
                    <span className="jj-doc-list__desc">{doc.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </Layout>
  );
}
