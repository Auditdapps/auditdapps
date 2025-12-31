// src/pages/HowItWorks.tsx
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

/** Motion variants */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-700/80 bg-blue-50 ring-1 ring-blue-100 px-3 py-1 rounded-full">
              <SparkleIcon className="h-4 w-4" /> How it works
            </p>
            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight">
              AI-powered self-audits for smart contracts —
              <span className="block text-blue-600">fast, structured, and actionable.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-slate-600">
              Run an instant security self-audit, get prioritized recommendations, track
              implementation, and download a completion certificate to share with your community or
              investors.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/self-audit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Audit
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              No wallet connection required for the self-audit. Premium plan adds expert review &
              certificate.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 4-Step Process */}
      <section className="border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            The 4-step self-audit flow
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-2 text-slate-600 max-w-2xl"
          >
            Designed with industry checklists and best practices for DeFi and smart contracts.
          </motion.p>

          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <StepCard
              step="01"
              title="Choose your path"
              desc="Select Developer or Organization to tailor the checklist."
              Icon={RouteIcon}
            />
            <StepCard
              step="02"
              title="Answer checklist"
              desc='One question at a time with progress. Add notes & "Other" items.'
              Icon={ChecklistIcon}
            />
            <StepCard
              step="03"
              title="AI recommendations"
              desc="Get prioritized, actionable fixes mapped to common risk categories."
              Icon={BoltIcon}
            />
            <StepCard
              step="04"
              title="Track & certify"
              desc="Mark items implemented, then download a shareable certificate."
              Icon={ShieldCheckIcon}
            />
          </motion.ol>
        </div>
      </section>

      {/* Why trust it */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left: reasons + CTAs */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Why teams trust Audit Dapps</h3>
              <ul className="mt-6 space-y-4 text-slate-700">
                <FeatureItem title="Specialised for Web3 & DeFi">
                  Purpose-built questions and heuristics for smart contracts, not generic AI prompts.
                </FeatureItem>
                <FeatureItem title="Transparent & auditable">
                  Keep a full history of answers, generated recommendations, and implementation status.
                </FeatureItem>
                <FeatureItem title="Human-in-the-loop (premium)">
                  Optional expert review to validate fixes and strengthen investor confidence.
                </FeatureItem>
              </ul>
              <div className="mt-8 flex gap-3">
                <Link
                  to="/about"
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
                >
                  About Audit Dapps
                </Link>
                <Link
                  to="/blog"
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
                >
                  Read our methodology
                </Link>
              </div>
            </motion.div>

            {/* Right: Severity Bar Chart (replaces image/mock) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Risk & severity snapshot</p>
                <span className="text-xs text-slate-500">Sample from recent self-audits</span>
              </div>

              <div className="mt-5 grid gap-4">
                <SeverityBar label="Critical" value={30} color="bg-rose-600" />
                <SeverityBar label="High" value={55} color="bg-amber-500" />
                <SeverityBar label="Medium" value={72} color="bg-blue-600" />
                <SeverityBar label="Low" value={88} color="bg-emerald-600" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <Stat label="Confidence" value="87%" />
                <Stat label="Coverage" value="76%" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">FAQs</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <FaqItem
              q="Are the recommendations really AI-generated?"
              a="Yes. We use an AI engine tuned for security best practices. On premium, a human expert can review your report for added assurance."
            />
            <FaqItem
              q="Do I need to connect a wallet or deploy code?"
              a="No. The self-audit is questionnaire-based. You can optionally link a repo or paste snippets for context."
            />
            <FaqItem
              q="Is this a replacement for a full audit?"
              a="It’s a pre-audit tool to catch obvious risks and prepare you for formal audits at lower cost and higher speed."
            />
            <FaqItem
              q="Can I export and share the certificate?"
              a="Yes. Once you mark items as implemented, you can generate a PDF certificate for stakeholders."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50"
      >
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to run your self-audit?</h3>
          <p className="mt-2 text-slate-600">It takes about 10–15 minutes. Start free, upgrade anytime.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/self-audit"
              className="rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Start Audit
            </Link>
            <Link
              to="/pricing"
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-white"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

/* ----------------------------- UI Subcomponents ---------------------------- */

type IconProps = { className?: string };

function StepCard({
  step,
  title,
  desc,
  Icon,
}: {
  step: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<IconProps>;
}) {
  return (
    <motion.li
      variants={fadeUp}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">{step}</span>
          </div>
          <h4 className="mt-1 text-base font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
    </motion.li>
  );
}

function FeatureItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckIcon className="mt-1 h-5 w-5 flex-none text-blue-600" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-slate-600 text-sm">{children}</p>
      </div>
    </li>
  );
}

/** Simple stat cell */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

/** Accessible severity bar */
function SeverityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number; // 0–100
  color: string; // Tailwind bg-*
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-slate-600">{v}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h4 className="font-semibold">{q}</h4>
      <p className="mt-2 text-sm text-slate-600">{a}</p>
    </motion.div>
  );
}

/* -------------------------------- Inline SVGs ------------------------------- */

function SparkleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 4.7L18 8.5l-4.2 1.8L12 15l-1.8-4.7L6 8.5l4.2-1.8L12 2zm7 6l1.2 3.2L23 12l-2.8.8L19 16l-.8-3.2L15 12l3.2-.8L19 8zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />
    </svg>
  );
}

function RouteIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M5 4h6a4 4 0 010 8H9a4 4 0 000 8h10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={5} cy={4} r={1.5} fill="currentColor" />
      <circle cx={19} cy={20} r={1.5} fill="currentColor" />
    </svg>
  );
}

function ChecklistIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="M4.5 6.5l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 12.5l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 18.5l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
