import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Globe,
  Users,
  FileText,
  Activity,
  Radar,
  Sparkles,
} from "lucide-react";

import ThreeJsBackdrop from "@/components/ThreeJsBackdrop";
import { Button } from "@/components/ui/button";
import bgImg from "@/assets/img/hero_bg_2_1.jpg";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
};

const features: Feature[] = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Developer Security Self Audit",
    description:
      "A guided checklist for building safer Web2 applications, APIs, and services.",
    bullets: [
      "Secure coding hygiene and common logic flaws",
      "Dependency and supply chain risk awareness",
      "Build and deployment hygiene",
      "Identity and access control checks",
    ],
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Organisation Governance Audit",
    description:
      "Operational controls that protect real teams and real data, even without a dedicated security department.",
    bullets: [
      "MFA adoption and privileged access review",
      "Backups and incident readiness",
      "Vendor and third party risk awareness",
      "Employee lifecycle and access offboarding",
    ],
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Website Security Scanner",
    description:
      "Automated surface checks to spot misconfigurations and basic exposure.",
    bullets: [
      "TLS and basic security headers review",
      "Common misconfigurations and exposure signals",
      "Outdated stacks and risk indicators",
      "Clear, actionable summaries",
    ],
  },
  {
    icon: <Radar className="h-5 w-5" />,
    title: "NGO and SME Security Templates",
    description:
      "Frameworks tailored for small organisations that handle sensitive user or donor data.",
    bullets: [
      "Charity and NGO data handling templates",
      "Low overhead controls for small teams",
      "Clarity over complexity",
      "Practical guidance for limited budgets",
    ],
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Pentest Ready Report Generator",
    description:
      "Exportable findings to prepare for external reviews and reduce surprises.",
    bullets: [
      "Structured findings and remediation steps",
      "Maturity scoring and gap highlights",
      "Governance visibility alongside technical issues",
      "Clean exports for stakeholders",
    ],
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Continuous Risk Dashboard",
    description:
      "Track improvement over time across people, process, and systems.",
    bullets: [
      "Identity and access control progress",
      "Patch and update hygiene tracking",
      "Operational readiness and monitoring",
      "A history you can iterate on",
    ],
  },
];

export default function Web2Solutions() {
  return (
    <main id="main" className="text-slate-800">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={bgImg}
            alt="Abstract security background"
            className="h-[420px] w-full object-cover md:h-[520px]"
          />
          <div className="absolute inset-0">
            <ThreeJsBackdrop modelPath="/models/network.glb" />
          </div>
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 bottom-[-100px] h-[200px] bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 md:pb-24 md:pt-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center text-white"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" /> Web2 Security - Coming Soon
              </span>
              <h1 className="mt-3 text-4xl font-bold md:text-5xl">
                AuditDapps <span className="text-blue-300">Web2 Solutions</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">
                Security intelligence for modern digital systems. We are extending our proven self-audit approach
                beyond smart contracts into Web2 applications, APIs, and organisational security hygiene.
              </p>

              <nav aria-label="Breadcrumb" className="mt-5 flex justify-center">
                <ol className="inline-flex items-center space-x-2 text-white/80">
                  <li>
                    <Link to="/" className="transition hover:text-white hover:underline">
                      Home
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mx-1 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium" aria-current="page">
                      Web2 Solutions
                    </span>
                  </li>
                </ol>
              </nav>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild className="rounded-full font-semibold">
                  <Link to="/contact?topic=web2-early-access">Join early access list</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15"
                >
                  <Link to="/how-it-works">See how AuditDapps works</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Vision ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="text-sm font-medium uppercase tracking-wide text-blue-700">
              Our Vision
            </span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              One unified view of security maturity
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              To make security maturity accessible to every digital organisation — from blockchain teams to
              traditional Web2 businesses, NGOs, and SMEs.
            </p>
            <p className="mt-3 leading-relaxed text-slate-700">
              Security is not just for enterprises or experts. Every organisation deserves simple, intelligent tools
              that help them understand risk, identify weaknesses, and build safer systems without needing a
              dedicated security department.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-7 shadow-sm">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-100 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <ShieldCheck className="h-5 w-5 text-indigo-700" />
                  </div>
                  <h3 className="text-lg font-semibold">A single framework</h3>
                </div>
                <p className="mt-3 text-slate-700">
                  AuditDapps is building a unified security intelligence platform that spans Web3 ecosystems,
                  Web2 applications and infrastructure, and organisational governance.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    Web3 smart contract ecosystems
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    Web2 apps, APIs, and infrastructure
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    Operational governance and access control
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-7 shadow-sm">
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-sky-100 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <Lock className="h-5 w-5 text-indigo-700" />
                  </div>
                  <h3 className="text-lg font-semibold">One continuous dashboard</h3>
                </div>
                <p className="mt-3 text-slate-700">
                  A single view of security posture over time. Clear baselines, repeatable audits, and an
                  improvement trail you can iterate on before external reviews.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    People, process, and platform maturity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    Actionable insights, not noise
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    Designed for small teams
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== What Web2 will include ===== */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-blue-700">
              What Web2 will include
            </span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Industry standard security expectations
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Web2 security is evergreen. We are building guided audits and clear reporting aligned with how modern
              teams actually ship software — from OWASP style application hygiene to operational governance.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3 text-indigo-700 ring-1 ring-slate-200 transition group-hover:bg-indigo-50">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{f.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why this matters ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45 }}
            >
              <span className="text-sm font-medium uppercase tracking-wide text-blue-700">
                Why this matters
              </span>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                One reality, many surfaces
              </h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Web2 and Web3 share the same vulnerabilities at their core: weak access control, poor governance,
                missing monitoring, untested incident response, and insecure development workflows.
              </p>
              <p className="mt-3 leading-relaxed text-slate-700">
                Blockchain systems exposed these failures publicly. Traditional Web2 organisations still struggle
                with them quietly. AuditDapps brings a unified, guided approach that helps teams understand risk and
                improve security maturity with clarity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-7 shadow-sm"
            >
              <h3 className="text-lg font-semibold">Common failure patterns we target</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Weak access control",
                  "Poor secrets handling",
                  "Fragile deployment hygiene",
                  "Missing monitoring",
                  "Unclear ownership",
                  "Untested incident response",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                  >
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-700">
                Our goal is to make security review repeatable, measurable, and practical for teams without large
                security budgets.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== What makes AuditDapps different ===== */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-blue-700">
              What makes AuditDapps different
            </span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Security posture, not just findings</h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Most tools solve one slice of the problem. AuditDapps is built to help teams understand their overall
              security maturity across Web2 and Web3, with guided audits, clear scoring, and actionable next steps.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Unified Web2 + Web3 maturity", desc: "One platform that supports both ecosystems under a consistent audit approach." },
              { title: "Built for small teams", desc: "Guided self-audits that work for developers, SMEs, charities, and NGOs." },
              { title: "Concise recommendations", desc: "Clear next steps focused on risk reduction, not noisy alerts." },
              { title: "Governance first", desc: "Operational controls and access hygiene are treated as first class security signals." },
              { title: "Explainable by design", desc: "Deterministic checks where possible, and AI used for explanation rather than authority." },
              { title: "Continuous improvement trail", desc: "Audit history and tracking to measure security progress over time." },
            ].map((x) => (
              <div key={x.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{x.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-sky-600 p-8 text-white shadow-sm md:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold md:text-3xl">
                  Coming soon - be the first to try AuditDapps Web2
                </h2>
                <p className="mt-3 text-white/90">
                  Join the early access list to get updates, pilot opportunities, and launch notification.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Button asChild className="w-full rounded-full bg-white text-slate-900 hover:bg-white/90 md:w-auto">
                  <Link to="/contact?topic=web2-early-access">Join early access</Link>
                </Button>
                <p className="text-xs text-white/80">
                 <p className="text-xs text-white/80">
                Prefer email? Contact us and mention Web2 early access.
                </p>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
