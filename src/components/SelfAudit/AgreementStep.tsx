// src/components/SelfAudit/AgreementStep.tsx
import { useState, ChangeEvent, FC, useCallback } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ShieldCheck, FileText, Lock, Check } from "lucide-react";

interface AgreementStepProps {
  onAgree: (value: boolean) => void;
}

const AgreementStep: FC<AgreementStepProps> = ({ onAgree }) => {
  const [checked, setChecked] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  const handleContinue = useCallback(() => {
    if (checked) onAgree(true);
  }, [checked, onAgree]);

  // Allow Enter to continue, but don’t hijack when unchecked.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && checked) {
      e.preventDefault();
      handleContinue();
    }
  };

  // ✅ Type the variants to satisfy TS
  const fade: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl"
      onKeyDown={onKeyDown}
      role="region"
      aria-labelledby="agreement-title"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
        {/* Decorative gradient ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-200/70 to-sky-200/40 blur-2xl"
        />

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 id="agreement-title" className="text-2xl font-bold tracking-tight text-slate-900">
              Before You Begin
            </h2>
            <p className="text-sm text-slate-500">A few quick notes to keep the audit useful and safe.</p>
          </div>
        </div>

        {/* Body copy */}
        <p className="mb-6 text-slate-700">
          By proceeding, you agree to complete this self-audit honestly and to the best of your knowledge.
          Your responses help us assess the current security posture of your DApp and produce meaningful
          recommendations.
        </p>

        {/* Mini checklist */}
        <ul className="mb-6 grid gap-2 sm:grid-cols-3">
          <li className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </span>
            Be accurate and honest
          </li>
          <li className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </span>
            No production secrets in answers
          </li>
          <li className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </span>
            You control if/when results are shared
          </li>
        </ul>

        {/* Consent row */}
        <label htmlFor="agree" className="group mb-6 inline-flex cursor-pointer select-none items-center gap-3">
          <motion.span
            className={[
              "grid h-5 w-5 place-items-center rounded-md border transition",
              checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-transparent",
            ].join(" ")}
            whileTap={prefersReduced ? {} : { scale: 0.96 }}
          >
            <Check className="h-3.5 w-3.5" />
          </motion.span>
          <input id="agree" type="checkbox" className="sr-only" checked={checked} onChange={handleCheckbox} />
          <span className="text-sm text-slate-700">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-500"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-500"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-4 w-4" />
            We store your answers securely. See our{" "}
            <a
              href="/privacy"
              className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
            >
              Privacy Policy
            </a>
            .
          </div>

          <motion.button
            onClick={handleContinue}
            disabled={!checked}
            whileHover={checked && !prefersReduced ? { y: -1 } : {}}
            whileTap={checked && !prefersReduced ? { scale: 0.98 } : {}}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
              checked ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700" : "bg-slate-300 text-white cursor-not-allowed",
            ].join(" ")}
            aria-disabled={!checked}
          >
            <ShieldCheck className="h-4 w-4" />
            Continue
          </motion.button>
        </div>

        {/* Bottom links (small) */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <a href="/terms" className="inline-flex items-center gap-1 hover:text-slate-700">
            <FileText className="h-3.5 w-3.5" /> Terms
          </a>
          <a href="/privacy" className="inline-flex items-center gap-1 hover:text-slate-700">
            <Lock className="h-3.5 w-3.5" /> Privacy
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default AgreementStep;
