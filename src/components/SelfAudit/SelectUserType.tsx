// src/components/SelfAudit/SelectUserType.tsx
import React, { FC } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Code2, Building2, ArrowRight, Sparkles } from "lucide-react";

interface SelectUserTypeProps {
  onSelect: (type: "developer" | "organization") => void;
}

const SelectUserType: FC<SelectUserTypeProps> = ({ onSelect }) => {
  const prefersReduced = useReducedMotion();

  // ✅ Type variants
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const handleKeySelect =
    (type: "developer" | "organization") =>
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(type);
      }
    };

  return (
    <section className="relative mx-auto max-w-4xl">
      {/* Soft gradient accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-200/50 to-sky-200/40 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-tr from-sky-200/50 to-indigo-200/40 blur-2xl"
      />

      <div className="relative rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
            <Sparkles className="h-3.5 w-3.5" />
            Pick your path
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Who are you?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose the option that best describes you to load the most relevant self-audit checklist.
          </p>
        </div>

        {/* Cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Developer */}
          <motion.button
            type="button"
            variants={card}
            onClick={() => onSelect("developer")}
            onKeyDown={handleKeySelect("developer")}
            className="group relative w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm outline-none ring-indigo-300 transition hover:shadow-md focus-visible:ring-2"
            aria-label="I am a Developer"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 transition group-hover:bg-indigo-100">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">I’m a Developer</h3>
                <p className="text-xs text-slate-500">Solo devs & small teams</p>
              </div>
            </div>
            <ul className="mb-5 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Checklist for smart contracts & deployment</li>
              <li>Keys, upgrades, ERC-20/721 pitfalls</li>
              <li>Pre-audit hygiene & invariants</li>
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
              Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-indigo-200"
            />
          </motion.button>

          {/* Organization */}
          <motion.button
            type="button"
            variants={card}
            onClick={() => onSelect("organization")}
            onKeyDown={handleKeySelect("organization")}
            className="group relative w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm outline-none ring-indigo-300 transition hover:shadow-md focus-visible:ring-2"
            aria-label="I represent an Organization"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 transition group-hover:bg-sky-100">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">I represent an Organization</h3>
                <p className="text-xs text-slate-500">Protocols, DAOs, enterprises</p>
              </div>
            </div>
            <ul className="mb-5 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Governance, custody & incident response</li>
              <li>Oracle/bridge usage, monitoring & SLAs</li>
              <li>Change management & formal reviews</li>
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
              Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-sky-200"
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default SelectUserType;
