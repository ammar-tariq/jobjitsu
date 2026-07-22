import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Is JobJitsu a cloud résumé SaaS?",
    a: (
      <>
        No. Privacy is architecture: career data stays on-device by default. See{" "}
        <Link to="/docs/product/NON_GOALS">non-goals</Link> and{" "}
        <Link to="/docs/product/PRODUCT_VISION">product vision</Link>.
      </>
    ),
  },
  {
    q: "Does the Agent send applications for me automatically?",
    a: (
      <>
        No. The Agent prepares; humans own Send. Approval-before-send is the default posture — see{" "}
        <Link to="/docs/product/FEATURES">Features</Link> and{" "}
        <Link to="/docs/architecture/PACKAGE_BOUNDARIES">package boundaries</Link>.
      </>
    ),
  },
  {
    q: "Why do you say “Agent” instead of “Local LLM” in the UI?",
    a: (
      <>
        Brand and terminology reserve model jargon for advanced settings. Status chrome is{" "}
        <strong>Agent · On-device</strong>. See{" "}
        <Link to="/docs/product/TERMINOLOGY">terminology</Link> and{" "}
        <Link to="/docs/brand/BRANDING_FOR_DEVELOPMENT">branding for development</Link>.
      </>
    ),
  },
  {
    q: "Is JobJitsu a job board?",
    a: (
      <>
        No. It may help discover and curate roles; it does not become the marketplace. Clarified in{" "}
        <Link to="/docs/product/NON_GOALS">non-goals</Link>.
      </>
    ),
  },
  {
    q: "Where do I find what to build next?",
    a: (
      <>
        Start at the <Link to="/docs/backlog/">backlog</Link>, follow dependency waves, and use
        platform stories under <Link to="/docs/roadmap/USER_STORIES">docs/roadmap</Link>.
        Orientation: <Link to="/roadmap">Roadmap</Link>.
      </>
    ),
  },
  {
    q: "How do I run the documentation website?",
    a: (
      <>
        <code>pnpm --filter @jobjitsu/website dev</code> — see{" "}
        <Link to="/installation">Installation</Link> and <Link to="/quick-start">Quick start</Link>.
        Content comes from <code>/docs</code> without duplication.
      </>
    ),
  },
];

export default function FaqPage(): ReactNode {
  return (
    <GuideLayout
      title="FAQ"
      description="Short answers that point at the living documentation. Prefer the linked docs when details matter."
      docs={[
        {
          label: "Product vision",
          to: "/docs/product/PRODUCT_VISION",
          description: "Mission and north star.",
        },
        {
          label: "Non-goals",
          to: "/docs/product/NON_GOALS",
          description: "Explicit out-of-scope product choices.",
        },
        {
          label: "Principles",
          to: "/docs/product/PRINCIPLES",
          description: "Decision filters.",
        },
        {
          label: "Voice & tone",
          to: "/docs/brand/VOICE_AND_TONE",
          description: "How JobJitsu speaks.",
        },
      ]}
    >
      <dl className="jj-faq">
        {FAQS.map((item) => (
          <div key={item.q} className="jj-faq__item">
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
    </GuideLayout>
  );
}
