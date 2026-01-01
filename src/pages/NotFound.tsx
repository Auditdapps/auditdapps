// src/pages/NotFound.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import {
  Ghost,
  ArrowLeft,
  Home,
  LifeBuoy,
  ShieldCheck,
  FileSearch,
  Rocket,
  Newspaper,
  Mail,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-gradient-to-b from-white to-slate-50">
      {/* Subtle brand grid & glow */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(50rem_35rem_at_50%_-10%,rgba(59,130,246,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[url('/grid.svg')] opacity-[0.04]" />

      {/* Animated brand blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 md:py-32">
        {/* Top chip with path */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mb-6 w-fit rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur"
        >
          Requested path: <span className="font-mono text-slate-800">{pathname}</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto text-center"
        >
          <Ghost className="mx-auto mb-4 h-16 w-16 text-blue-600" />
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <p className="mt-2 text-lg font-semibold text-slate-900">Page not found</p>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            The page you’re looking for doesn’t exist—or might have been moved. Try one
            of these quick actions.
          </p>

        {/* Primary actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </motion.button>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-white"
              >
                <LifeBuoy className="h-4 w-4" />
                Contact support
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Suggested destinations */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
        >
          <QuickLink
            to="/self-audit"
            title="Start self-audit"
            desc="Run a guided pre-audit in minutes."
            Icon={ShieldCheck}
            accent="from-blue-600 to-indigo-600"
          />
          <QuickLink
            to="/pricing"
            title="See pricing"
            desc="Choose a plan that fits."
            Icon={Rocket}
            accent="from-emerald-600 to-teal-600"
          />
          <QuickLink
            to="/blog"
            title="Methodology & tips"
            desc="Read guides and updates."
            Icon={Newspaper}
            accent="from-violet-600 to-fuchsia-600"
          />
          <QuickLink
            to="/how-it-works"
            title="How it works"
            desc="Understand the flow."
            Icon={FileSearch}
            accent="from-sky-600 to-cyan-600"
          />
          <QuickLink
            to="/about"
            title="About the team"
            desc="Who is behind Audit DApps."
            Icon={Mail}
            accent="from-rose-600 to-orange-600"
          />
          <QuickLink
            to="/contact"
            title="Get in touch"
            desc="We’ll help you quickly."
            Icon={LifeBuoy}
            accent="from-indigo-600 to-blue-600"
          />
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-8 max-w-xl text-center text-xs text-slate-400"
        >
          If you believe this is a mistake, please{" "}
          <Link to="/contact" className="underline">
            let us know
          </Link>
          .
        </motion.p>
      </div>
    </main>
  );
}

/* --------------------------------- Parts ---------------------------------- */

function QuickLink({
  to,
  title,
  desc,
  Icon,
  accent = "from-blue-600 to-indigo-600",
}: {
  to: string;
  title: string;
  desc: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: string;
}) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
      <Link
        to={to}
        className="group block rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">{title}</div>
            <p className="mt-0.5 text-sm text-slate-600">{desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
