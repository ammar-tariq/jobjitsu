import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

/**
 * Public terms — for Google OAuth consent and general project use.
 * Calm, precise; no SaaS guarantees.
 */
export default function TermsPage(): ReactNode {
  return (
    <Layout
      title="Terms of Service"
      description="Terms for using JobJitsu — open-source, local-first career OS. No interview guarantees; you own send."
    >
      <main className="jj-guide">
        <div className="container jj-guide__inner">
          <header className="jj-guide__header">
            <Heading as="h1">Terms of Service</Heading>
            <p className="jj-guide__lede">
              Last updated: 13 August 2026. By using JobJitsu (the desktop app, source code, or this
              documentation site), you agree to these terms.
            </p>
          </header>

          <div className="jj-guide__body">
            <Heading as="h2">What JobJitsu is</Heading>
            <p>
              JobJitsu is an open-source, local-first AI Career Operating System. An on-device{" "}
              <strong>Agent</strong> can help prepare drafts, queues, and reminders.{" "}
              <strong>You</strong> remain responsible for what you send, apply, or disclose to
              employers.
            </p>

            <Heading as="h2">License</Heading>
            <p>
              Software in the repository is offered under the license files published with the
              source (
              <Link href="https://github.com/ammar-tariq/jobjitsu">
                github.com/ammar-tariq/jobjitsu
              </Link>
              ). Documentation on this site is part of that project unless a page says otherwise.
            </p>

            <Heading as="h2">Your responsibilities</Heading>
            <ul>
              <li>
                You are responsible for content you store on your device and for actions you approve
                (including applications and follow-ups).
              </li>
              <li>
                If you connect Gmail or Outlook, you must comply with Google&apos;s and
                Microsoft&apos;s terms for those services. JobJitsu requests readonly mail access
                for import only.
              </li>
              <li>
                You must not use JobJitsu to harass, spam, misrepresent yourself, or violate
                employer or platform rules.
              </li>
            </ul>

            <Heading as="h2">No career guarantees</Heading>
            <p>
              JobJitsu does not promise interviews, offers, or hiring outcomes. Features are
              described as help to draft, tailor, queue, and remind — not as guaranteed results.
            </p>

            <Heading as="h2">Availability and changes</Heading>
            <p>
              The project is under active development. Features may change, break, or remain
              incomplete. This site and the app may be updated without prior notice. We may revise
              these terms; the date above will change when we do.
            </p>

            <Heading as="h2">Disclaimer of warranties</Heading>
            <p>
              JobJitsu is provided &quot;as is&quot;, without warranties of any kind, to the fullest
              extent permitted by law — including merchantability, fitness for a particular purpose,
              and non-infringement.
            </p>

            <Heading as="h2">Limitation of liability</Heading>
            <p>
              To the fullest extent permitted by law, contributors and maintainers are not liable
              for indirect, incidental, special, consequential, or punitive damages, or for lost
              profits, data, or opportunities arising from use of JobJitsu.
            </p>

            <Heading as="h2">Third-party services</Heading>
            <p>
              Optional connections (for example Google or Microsoft sign-in) are governed by those
              providers. JobJitsu is not responsible for their availability, policies, or account
              actions.
            </p>

            <Heading as="h2">Contact</Heading>
            <p>
              Questions:{" "}
              <Link href="https://github.com/ammar-tariq/jobjitsu/issues">GitHub Issues</Link> or{" "}
              <Link href="https://github.com/ammar-tariq/jobjitsu/discussions">Discussions</Link>.
            </p>

            <p>
              Related: <Link to="/privacy">Privacy Policy</Link> · <Link to="/">Home</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
