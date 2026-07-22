import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { GuideLayout } from "../components/GuideLayout";

export default function PluginsPage(): ReactNode {
  return (
    <GuideLayout
      title="Plugins"
      description="Plugins are capability-gated agent skills — user-enabled, inspectable, and unable to own Send or silently exfiltrate career data."
      docs={[
        {
          label: "Extension system",
          to: "/docs/architecture/EXTENSION_SYSTEM",
          description: "Contribution points and host contracts.",
        },
        {
          label: "Plugin system ADR",
          to: "/docs/adr/0004-plugin-system",
          description: "Accepted plugin architecture decision.",
        },
        {
          label: "Extension system ADR",
          to: "/docs/adr/0012-extension-system",
          description: "Portability and contribution surface.",
        },
        {
          label: "Terminology",
          to: "/docs/product/TERMINOLOGY",
          description: "Plugin means agent skill — not host UI.",
        },
      ]}
    >
      <p>
        Skills load through the host with explicit capabilities. A failing or disabled plugin fails
        closed; it must not crash the app or bypass approval gates.
      </p>
      <p>
        Deep contracts live in{" "}
        <Link to="/docs/architecture/EXTENSION_SYSTEM">docs/architecture/EXTENSION_SYSTEM</Link>.
      </p>
    </GuideLayout>
  );
}
