// src/components/BestService.tsx
import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import ThreeJsBackdrop from "./ThreeJsBackdrop";
import { ShieldCheck, SearchCheck } from "lucide-react";

type Service = {
  title: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  plateBg: string;
  plateRing: string;
  iconText: string;
  gradFrom: string;
  gradTo: string;
  badge?: string;
};

const services: Service[] = [
  {
    title: "Empowering You for Robust Security",
    desc:
      "Embark on a journey of empowerment with AuditDApps. Use our guided self-audit framework to harden your DApp early with industry-aligned checks and fast, actionable feedback.",
    Icon: ShieldCheck,
    plateBg: "bg-indigo-50",
    plateRing: "ring-indigo-100",
    iconText: "text-indigo-600/90",
    gradFrom: "from-indigo-400",
    gradTo: "to-sky-400",
  },
  {
    title: "Unparalleled Scrutiny for Your DApp",
    desc:
      "When you need deeper assurance, our experts provide meticulous manual reviews that surface subtle risks, validate fixes, and prioritize what truly matters.",
    Icon: SearchCheck,
    plateBg: "bg-sky-50",
    plateRing: "ring-sky-100",
    iconText: "text-sky-600/90",
    gradFrom: "from-sky-400",
    gradTo: "to-cyan-400",
    badge: "Expert-led",
  },
];

const BestService: React.FC = () => {
  const prefersReduced = useReducedMotion();

  // ✅ Type your variants so TS is happy with `variants={...}`
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <section id="service-sec" className="relative overflow-hidden bg-white py-24">
      {/* Subtle 3D backdrop (falls back to glossy torus if model missing) */}
      <ThreeJsBackdrop modelPath="/models/shield.glb" />

      {/* Soft depth gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 z-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-200/40 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-24 z-0 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-200/50 to-transparent blur-2xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
            Our Featured Services
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Our Best Service
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
            Tools and expertise to navigate the complex landscape of DApp security—
            from self-serve hardening to expert reviews—so you can ship with confidence.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          {services.map(({ title, desc, Icon, plateBg, plateRing, iconText, gradFrom, gradTo, badge }) => (
            <motion.article
              key={title}
              variants={card}
              whileHover={{
                y: -6,
                rotateX: prefersReduced ? 0 : 2,
                rotateY: prefersReduced ? 0 : -2,
              }}
              className="group relative rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur transition"
            >
              {/* Hover accent ring */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-indigo-200" />

              {/* Optional badge */}
              {badge && (
                <span className="absolute -top-2 right-3 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  {badge}
                </span>
              )}

              {/* Icon plate */}
              <div className="mb-5">
                <div
                  className={[
                    "mx-auto grid h-16 w-16 place-items-center rounded-2xl ring-1 transition group-hover:brightness-110",
                    plateBg,
                    plateRing,
                  ].join(" ")}
                >
                  <Icon className={["h-8 w-8", iconText].join(" ")} />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>

              {/* Bottom accent gradient */}
              <div
                className={[
                  "mt-5 h-[3px] w-16 rounded opacity-80 transition group-hover:w-24",
                  "bg-gradient-to-r",
                  gradFrom,
                  gradTo,
                ].join(" ")}
              />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BestService;
