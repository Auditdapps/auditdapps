import { useEffect } from "react";
import {
  Shield,
  Database,
  Cookie,
  Globe,
  Lock,
  UserCheck,
  Mail,
  ServerCog,
  FileKey2,
} from "lucide-react";

const COMPANY = "Audit Dapps";
const CONTACT_EMAIL = "privacy@auditdapps.com";
const LAST_UPDATED = "September 12, 2025";

/** Privacy Policy */
export default function Privacy() {
  useEffect(() => {
    document.title = `Privacy Policy – ${COMPANY}`;
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <header className="mb-8 lg:mb-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white grid place-items-center shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* TOC */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <div className="rounded-xl border bg-white p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                On this page
              </h2>
              <ol className="space-y-2 text-sm">
                {[
                  ["scope", "1. Scope"],
                  ["data", "2. Data We Collect"],
                  ["use", "3. How We Use Data"],
                  ["legal", "4. Legal Bases (GDPR)"],
                  ["cookies", "5. Cookies & Analytics"],
                  ["security", "6. Security"],
                  ["retention", "7. Data Retention"],
                  ["transfer", "8. International Transfers"],
                  ["rights", "9. Your Rights"],
                  ["sub", "10. Sub-processors"],
                  ["children", "11. Children"],
                  ["changes", "12. Changes"],
                  ["contact", "13. Contact"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={`#${href}`}
                      className="text-slate-600 hover:text-emerald-700 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* Content */}
          <article className="prose prose-slate max-w-none">
            <section id="scope">
              <h2>1. Scope</h2>
              <p>
                This Privacy Policy explains how <strong>{COMPANY}</strong> (“we”, “us”)
                collects, uses, and protects personal information when you use our websites
                and services (the “Services”).
              </p>
            </section>

            <section id="data">
              <h2>2. Data We Collect</h2>
              <ul>
                <li><strong>Account & Auth</strong> — email, password hash, OAuth identifiers.</li>
                <li><strong>Profile</strong> — organization name, role, preferences you share.</li>
                <li><strong>Usage</strong> — pages visited, feature interactions, device and browser info.</li>
                <li><strong>Audit Inputs</strong> — self-assessment answers, generated charts/metrics, and attachments you upload.</li>
                <li><strong>Support</strong> — messages you send to us (email, forms).</li>
              </ul>
            </section>

            <section id="use">
              <h2>3. How We Use Data</h2>
              <ul>
                <li>Provide, maintain, and improve the Services.</li>
                <li>Secure accounts, prevent fraud/abuse, and diagnose issues.</li>
                <li>Generate dashboards, charts, and recommendations from your inputs.</li>
                <li>Communicate service updates and respond to requests.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section id="legal">
              <h2>4. Legal Bases (GDPR)</h2>
              <ul>
                <li><strong>Contract</strong> — to deliver the Services you request.</li>
                <li><strong>Legitimate interests</strong> — to secure, improve, and understand usage.</li>
                <li><strong>Consent</strong> — for optional communications and certain cookies.</li>
                <li><strong>Legal obligation</strong> — to meet compliance or law-enforcement requests.</li>
              </ul>
            </section>

            <section id="cookies">
              <h2>5. Cookies & Analytics</h2>
              <div className="not-prose grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4 flex items-start gap-3">
                  <Cookie className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Essential cookies</p>
                    <p className="text-slate-600">Used for login sessions and security. You can’t opt out of these.</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-4 flex items-start gap-3">
                  <Globe className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Analytics</p>
                    <p className="text-slate-600">
                      We may use privacy-friendly analytics to understand usage patterns.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="security">
              <h2>6. Security</h2>
              <div className="not-prose rounded-xl border bg-slate-50 p-4 flex gap-3 mb-3">
                <Lock className="h-5 w-5 text-slate-700 mt-0.5" />
                <p className="text-sm text-slate-700">
                  We use industry-standard measures (encryption in transit, least-privilege access,
                  audit logging where available). No method is 100% secure; help us protect your
                  account with strong, unique passwords and MFA where supported.
                </p>
              </div>
            </section>

            <section id="retention">
              <h2>7. Data Retention</h2>
              <p>
                We retain personal data for as long as needed to provide the Services and meet legal,
                accounting, or reporting requirements. You can request deletion (subject to lawful exceptions).
              </p>
            </section>

            <section id="transfer">
              <h2>8. International Transfers</h2>
              <p>
                Data may be processed in the country where our hosting or sub-processors operate. Where
                required, we rely on appropriate safeguards (e.g., SCCs) for cross-border transfers.
              </p>
            </section>

            <section id="rights">
              <h2>9. Your Rights</h2>
              <ul>
                <li>Access, correct, or delete your personal data.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Portability (receive a copy in a structured format).</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Lodge a complaint with your local data protection authority.</li>
              </ul>
            </section>

            <section id="sub">
              <h2>10. Sub-processors</h2>
              <div className="not-prose rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ServerCog className="h-5 w-5 text-emerald-600" />
                  <p className="font-medium">Where relevant, we may use:</p>
                </div>
                <ul className="text-sm text-slate-700 list-disc pl-5">
                  <li>Authentication & database hosting (e.g., Supabase).</li>
                  <li>Cloud storage for uploaded assets.</li>
                  <li>Transactional email provider.</li>
                  <li>Privacy-centric analytics.</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">
                  We vet providers for security and data protection and sign appropriate data-processing agreements.
                </p>
              </div>
            </section>

            <section id="children">
              <h2>11. Children</h2>
              <p>
                The Services are not directed to children under 16. We do not knowingly collect data from children.
              </p>
            </section>

            <section id="changes">
              <h2>12. Changes</h2>
              <p>
                We may update this Policy periodically. We’ll update the “Last updated” date
                and notify you of material changes via email or in-app notice when appropriate.
              </p>
            </section>

            <section id="contact">
              <h2>13. Contact</h2>
              <div className="not-prose rounded-lg border bg-white p-4 flex gap-3">
                <Mail className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-slate-700">Questions or requests related to privacy?</p>
                  <p className="mt-1 inline-flex items-center gap-2">
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-700 hover:underline">
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
