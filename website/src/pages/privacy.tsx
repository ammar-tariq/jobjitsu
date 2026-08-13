import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

/**
 * Public privacy policy — required for Google OAuth consent (Gmail readonly).
 * Honest about local-first storage and inbound-only mailbox access.
 */
export default function PrivacyPage(): ReactNode {
  return (
    <Layout
      title="Privacy Policy"
      description="How JobJitsu handles data on your device — local-first by design, with optional readonly mailbox access you control."
    >
      <main className="jj-guide">
        <div className="container jj-guide__inner">
          <header className="jj-guide__header">
            <Heading as="h1">Privacy Policy</Heading>
            <p className="jj-guide__lede">
              Last updated: 13 August 2026. JobJitsu is a local-first, open-source desktop app. This
              page explains what stays on your device and what optional connections you can enable.
            </p>
          </header>

          <div className="jj-guide__body">
            <Heading as="h2">Summary</Heading>
            <ul>
              <li>
                Career data (résumé, preferences, applications, drafts) is stored{" "}
                <strong>on your device</strong> by default. JobJitsu does not run a cloud that holds
                your résumé.
              </li>
              <li>
                The on-device <strong>Agent</strong> prepares drafts. <strong>You</strong> own send
                — outbound actions require your approval by default.
              </li>
              <li>
                Optional email connect (Gmail / Outlook) is <strong>inbound only</strong> (read
                mail). JobJitsu never asks for your mailbox password and does not send mail through
                that connection.
              </li>
            </ul>

            <Heading as="h2">Who we are</Heading>
            <p>
              JobJitsu is an open-source project. Source and issues:{" "}
              <Link href="https://github.com/ammar-tariq/jobjitsu">
                github.com/ammar-tariq/jobjitsu
              </Link>
              . This website documents the project; it does not process your career data.
            </p>

            <Heading as="h2">Data on your device</Heading>
            <p>
              When you use the JobJitsu desktop app, profile, paths, résumés, applications, queue
              items, preferences, and Agent context are saved in a data folder you choose on that
              machine. You can back up or delete that folder like any other local files.
            </p>

            <Heading as="h2">Optional mailbox access (Gmail / Outlook)</Heading>
            <p>
              If you choose <strong>Connect Gmail</strong> or <strong>Connect Outlook</strong>,
              JobJitsu opens a browser sign-in for a Desktop OAuth client that you (or a packager)
              configure. Scopes are limited to reading mail (for example Gmail{" "}
              <code>gmail.readonly</code>, Microsoft Graph <code>Mail.Read</code> plus{" "}
              <code>offline_access</code> for token refresh).
            </p>
            <ul>
              <li>
                Access tokens stay in a local secrets store on your device. They are not returned to
                the UI over IPC and are not uploaded to a JobJitsu server.
              </li>
              <li>
                Imported mail is classified and matched on your device so you can see applications
                and reminders. Nothing is sent from this path.
              </li>
              <li>
                You can disconnect at any time. Disconnect removes tokens; imported copies remain
                until you delete them.
              </li>
            </ul>
            <p>
              Google or Microsoft may show their own consent and account controls. JobJitsu never
              receives your Google or Microsoft password.
            </p>

            <Heading as="h2">What we do not do</Heading>
            <ul>
              <li>We do not sell career data.</li>
              <li>We do not use mailbox content to train a shared JobJitsu model.</li>
              <li>
                We do not silently sync résumés to a JobJitsu cloud. See{" "}
                <Link to="/docs/product/NON_GOALS">non-goals</Link>.
              </li>
            </ul>

            <Heading as="h2">This documentation site</Heading>
            <p>
              Pages hosted on GitHub Pages are static documentation. They do not log into your
              mailbox or receive OAuth tokens. Hosting and analytics are subject to GitHub&apos;s
              own policies for Pages.
            </p>

            <Heading as="h2">Contact</Heading>
            <p>
              Questions about this policy: open an issue on{" "}
              <Link href="https://github.com/ammar-tariq/jobjitsu/issues">GitHub Issues</Link> or
              start a{" "}
              <Link href="https://github.com/ammar-tariq/jobjitsu/discussions">Discussion</Link>.
            </p>

            <p>
              Related: <Link to="/terms">Terms of Service</Link> · <Link to="/">Home</Link> ·{" "}
              <Link to="/faq">FAQ</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
