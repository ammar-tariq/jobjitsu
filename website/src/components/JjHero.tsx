import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Heading from "@theme/Heading";
import { JjPrivacyPill } from "./JjIcons";

type JjHeroProps = {
  primaryTo?: string;
  secondaryTo?: string;
};

/**
 * Full-bleed homepage hero — brand name + icon match Google OAuth consent branding.
 */
export function JjHero({
  primaryTo = "/getting-started",
  secondaryTo = "/docs/product/PRODUCT_VISION",
}: JjHeroProps): ReactNode {
  const iconSrc = useBaseUrl("/img/oauth-app-icon.png");
  const wordmarkSrc = useBaseUrl("/img/logo-full-horizontal.svg");
  return (
    <header className="hero hero--jj">
      <div className="hero--jj__plane" aria-hidden="true" />
      <div className="container hero--jj__compose">
        <img className="hero--jj__mark" src={iconSrc} width={96} height={96} alt="JobJitsu" />
        <img
          className="hero--jj__mark hero--jj__mark--wordmark"
          src={wordmarkSrc}
          width={280}
          height={64}
          alt="JobJitsu"
        />
        <Heading as="h1" className="hero__title">
          JobJitsu
        </Heading>
        <p className="hero--jj__tagline">The gentle art of landing the job.</p>
        <p className="hero__subtitle">
          JobJitsu is an open-source, local-first AI Career Operating System for your desktop. It
          helps you tailor résumés and cover letters, track applications, and optionally import
          job-related email from Gmail or Outlook — with readonly access you approve. Your career
          data stays on your device. The Agent prepares drafts; you own every send.
        </p>
        <p className="hero--jj__legal">
          <Link to="/privacy">Privacy Policy</Link>
          {" · "}
          <Link to="/terms">Terms of Service</Link>
        </p>
        <div className="hero--jj__actions">
          <Link className="button button--primary button--lg" to={primaryTo}>
            Getting started
          </Link>
          <Link className="button button--outline button--lg" to={secondaryTo}>
            Product vision
          </Link>
        </div>
        <div className="hero--jj__meta">
          <JjPrivacyPill />
          <p className="hero--jj__promises">On-device · On-target · On your terms</p>
        </div>
      </div>
    </header>
  );
}
