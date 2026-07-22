import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import {
  JjIconAgent,
  JjIconOnDevice,
  JjIconOnTarget,
  JjIconOnYourTerms,
  JjIconSend,
} from "./JjIcons";

type Feature = {
  title: string;
  body: string;
  to: string;
  icon: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "On-device",
    body: "Local Agent and on-device intelligence. Career data stays in the dojo by default.",
    to: "/docs/product/PRODUCT_VISION",
    icon: <JjIconOnDevice />,
  },
  {
    title: "On-target",
    body: "Technique over volume — fit, craft, and preference-driven throws.",
    to: "/docs/product/FEATURES",
    icon: <JjIconOnTarget />,
  },
  {
    title: "On your terms",
    body: "Preferences, pause, and approval before Send. The Agent prepares; you own egress.",
    to: "/docs/product/NON_GOALS",
    icon: <JjIconOnYourTerms />,
  },
  {
    title: "Agent · On-device",
    body: "Status chrome that tells the truth about locality — never a fake cloud badge.",
    to: "/docs/product/TERMINOLOGY",
    icon: <JjIconAgent />,
  },
  {
    title: "Human-owned Send",
    body: "The only career-data boundary. Honest outcomes; unknown is never success.",
    to: "/docs/architecture/PACKAGE_BOUNDARIES",
    icon: <JjIconSend />,
  },
];

/**
 * Feature cards — interaction containers linking into `/docs` (no copied specs).
 */
export function JjFeatureCards(): ReactNode {
  return (
    <section className="jj-features" aria-labelledby="jj-features-heading">
      <div className="container">
        <Heading as="h2" id="jj-features-heading">
          Why JobJitsu
        </Heading>
        <p className="jj-features__lede">
          Calm confidence from the brand guidelines — privacy as architecture, leverage over grind.
        </p>
        <ul className="jj-feature-grid">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <Link className="jj-feature-card" to={feature.to}>
                <span className="jj-feature-card__icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <span className="jj-feature-card__title">{feature.title}</span>
                <span className="jj-feature-card__body">{feature.body}</span>
                <span className="jj-feature-card__cta">Read docs</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
