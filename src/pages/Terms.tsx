import { useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Scale,
  AlertTriangle,
  ScrollText,
  Landmark,
  Mail,
} from "lucide-react";

const COMPANY = "Audit Dapps";
const CONTACT_EMAIL = "support@auditdapps.com";
const LAST_UPDATED = "September 12, 2025";

/** Terms of Service */
export default function Terms() {
  useEffect(() => {
    document.title = `Terms of Service – ${COMPANY}`;
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <header className="mb-8 lg:mb-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white grid place-items-center shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-sm text-slate-500">
                Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* TOC */}
          <nav className="hidden lg:block sticky top-24 self-start">
            <div className="rounded-xl border bg-white p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                On this page
              </h2>
              <ol className="space-y-2 text-sm">
                {[
                  ["acceptance", "1. Acceptance of Terms"],
                  ["eligibility", "2. Eligibility & Accounts"],
                  ["use", "3. Fair Use & Prohibited Conduct"],
                  ["software", "4. Software, Beta & Availability"],
                  ["selfaudit", "5. Self-Audit Disclaimer"],
                  ["billing", "6. Plans, Billing & Taxes"],
                  ["ip", "7. Intellectual Property"],
                  ["feedback", "8. Feedback & Publicity"],
                  ["thirdparty", "9. Third-Party Services"],
                  ["termination", "10. Termination"],
                  ["disclaimers", "11. Disclaimers"],
                  ["liability", "12. Limitation of Liability"],
                  ["indemnity", "13. Indemnification"],
                  ["law", "14. Governing Law"],
                  ["changes", "15. Changes to Terms"],
                  ["contact", "16. Contact"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={`#${href}`}
                      className="text-slate-600 hover:text-indigo-700 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* Content */}
          <article className="prose prose-slate max-w-none">
            {/* Notice */}
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 not-prose flex gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                These Terms are provided for general use. They are not legal advice.
                Please have your counsel review and adapt for your jurisdiction and corporate entity.
              </p>
            </div>

            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to <strong>{COMPANY}</strong>. By accessing or using our websites,
                APIs, or services (the “Services”), you agree to be bound by these Terms
                of Service (the “Terms”). If you do not agree, do not use the Services.
              </p>
            </section>

            <section id="eligibility">
              <h2>2. Eligibility & Accounts</h2>
              <ul>
                <li>You must be at least 18 years old and able to form a binding contract.</li>
                <li>You are responsible for the security of your account, credentials, and actions under it.</li>
                <li>Provide accurate information and keep it up to date.</li>
              </ul>
            </section>

            <section id="use">
              <h2>3. Fair Use & Prohibited Conduct</h2>
              <p>When using the Services you agree not to:</p>
              <ul>
                <li>Break the law or infringe third-party rights.</li>
                <li>Interfere with or disrupt the integrity or performance of the Services.</li>
                <li>Scan or test systems without authorization.</li>
                <li>Share credentials or circumvent rate limits or access controls.</li>
              </ul>
            </section>

            <section id="software">
              <h2>4. Software, Beta & Availability</h2>
              <ul>
                <li>We may offer beta features; they are provided “as is” and may change or end without notice.</li>
                <li>We strive for high availability but do not guarantee uptime. Maintenance or incidents may occur.</li>
              </ul>
            </section>

            <section id="selfaudit">
              <h2>5. Self-Audit Disclaimer</h2>
              <div className="not-prose rounded-xl border bg-white p-4 flex items-start gap-3 mb-3">
                <ShieldCheck className="h-5 w-5 text-indigo-600 mt-0.5" />
                <p className="text-sm text-slate-700">
                  The Services provide <em>self-assessment tooling</em>, best-practice
                  checklists, and educational material. Results do not constitute a
                  formal audit, certification, legal advice, or a warranty of security.
                  Use professional auditors where required.
                </p>
              </div>
              <p>
                You remain solely responsible for your code, deployments, and risk decisions.
              </p>
            </section>

            <section id="billing">
              <h2>6. Plans, Billing & Taxes</h2>
              <ul>
                <li>Paid plans renew automatically unless cancelled.</li>
                <li>Fees are non-refundable unless required by law.</li>
                <li>You are responsible for applicable taxes; we may collect where required.</li>
              </ul>
            </section>

            <section id="ip">
              <h2>7. Intellectual Property</h2>
              <p>
                We retain all rights in and to the Services and content. You grant us a
                non-exclusive license to process content you submit solely to provide the Services.
              </p>
            </section>

            <section id="feedback">
              <h2>8. Feedback & Publicity</h2>
              <p>
                If you provide feedback or suggestions, you grant {COMPANY} a perpetual,
                irrevocable, royalty-free license to use them without restriction.
              </p>
            </section>

            <section id="thirdparty">
              <h2>9. Third-Party Services</h2>
              <p>
                The Services may integrate third-party products (e.g., authentication,
                storage, analytics). Your use of those products is subject to their terms.
              </p>
            </section>

            <section id="termination">
              <h2>10. Termination</h2>
              <p>
                You may cancel at any time. We may suspend or terminate access for breach,
                legal requirement, or risk. Upon termination, your right to use the Services ends.
              </p>
            </section>

            <section id="disclaimers">
              <h2>11. Disclaimers</h2>
              <p>
                THE SERVICES ARE PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND. TO THE
                FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.
              </p>
            </section>

            <section id="liability">
              <h2>12. Limitation of Liability</h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, {COMPANY} SHALL NOT BE LIABLE FOR
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES,
                OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE.
              </p>
            </section>

            <section id="indemnity">
              <h2>13. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless {COMPANY} from claims
                arising from your use of the Services or violation of these Terms.
              </p>
            </section>

            <section id="law">
              <h2>14. Governing Law</h2>
              <div className="not-prose rounded-lg border bg-slate-50 p-4 flex gap-3">
                <Scale className="h-5 w-5 text-slate-600 mt-0.5" />
                <p className="text-sm text-slate-700">
                  These Terms are governed by the laws of your organization’s jurisdiction.
                  <br />
                  <strong>Action:</strong> replace this clause with your specific venue (e.g.,
                  “England & Wales” or “Delaware, USA”).
                </p>
              </div>
            </section>

            <section id="changes">
              <h2>15. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be
                noted by updating the “Last updated” date and, when appropriate, by email or in-app notice.
              </p>
            </section>

            <section id="contact">
              <h2>16. Contact</h2>
              <div className="not-prose rounded-lg border bg-white p-4 flex gap-3">
                <Landmark className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-slate-700">
                    For questions about these Terms, contact us:
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-700 hover:underline">
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <hr className="my-8" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {COMPANY}. All rights reserved.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
