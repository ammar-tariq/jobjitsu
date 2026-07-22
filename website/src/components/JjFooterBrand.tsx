import type { ReactNode } from "react";
import Link from "@docusaurus/Link";

/**
 * Branded footer strip — complements classic theme footer links.
 */
export function JjFooterBrand(): ReactNode {
  return (
    <div className="jj-footer-brand">
      <div className="container jj-footer-brand__inner">
        <Link to="/" className="jj-footer-brand__logo" aria-label="JobJitsu home">
          <img src="/img/logo.svg" width={40} height={40} alt="" />
          <span>
            <strong>JobJitsu</strong>
            <em>The gentle art of landing the job.</em>
          </span>
        </Link>
        <p className="jj-footer-brand__note">
          On-device · On-target · On your terms — see{" "}
          <Link to="/docs/brand/BRAND_GUIDELINES">brand guidelines</Link>.
        </p>
      </div>
    </div>
  );
}
