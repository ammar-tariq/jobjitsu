import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import { JjPrivacyPill } from "./JjIcons";

type JjHeroProps = {
  primaryTo?: string;
  secondaryTo?: string;
};

/**
 * Full-bleed homepage hero — brand first, single composition (BRAND_GUIDELINES §7).
 */
export function JjHero({
  primaryTo = "/quick-start",
  secondaryTo = "/docs/product/PRODUCT_VISION",
}: JjHeroProps): ReactNode {
  return (
    <header className="hero hero--jj">
      <div className="hero--jj__plane" aria-hidden="true" />
      <div className="container hero--jj__compose">
        <img className="hero--jj__mark" src="/img/logo.svg" width={56} height={56} alt="" />
        <p className="hero--jj__brand">JobJitsu</p>
        <Heading as="h1" className="hero__title">
          The gentle art of landing the job.
        </Heading>
        <p className="hero__subtitle">
          An open-source AI Career Operating System. Local Agent. On-device intelligence. Your
          résumé stays on your machine — nothing leaves except what you choose to send.
        </p>
        <div className="hero--jj__actions">
          <Link className="button button--primary button--lg" to={primaryTo}>
            Quick start
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
