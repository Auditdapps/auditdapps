// src/components/WhatWeDo.tsx
import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import ThreeJsBackdrop from "./ThreeJsBackdrop";
import { ClipboardCheck, FileSearch, BadgeCheck } from "lucide-react";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type Service = {
  title: string;
  desc: string;
  badge?: string;
  Icon: IconType;
  plateBg: string;   // Tailwind classes for the icon plate bg
  plateRing: string; // Tailwind ring color
  iconText: string;  // Tailwind text color for the icon
  gradFrom: string;  // Bottom accent gradient from
  gradTo: string;    // Bottom accent gradient to
};

const services: Service[] = [
  {
    title: "Self-Audit for Empowered Security",
    desc:
      "Our self-audit service puts the power of security directly in your hands. With an intuitive checklist, easily assess and enhance your DApp’s security posture based on industry best practices.",
    Icon: ClipboardCheck,
    plateBg: "bg-indigo-50",
    plateRing: "ring-indigo-100",
    iconText: "text-indigo-600/90",
    gradFrom: "from-indigo-400",
    gradTo: "to-sky-400",
  },
  {
    title: "Manual Audit by Blockchain Experts",
    desc:
      "For teams needing deeper assurance, our experts perform manual reviews to uncover intricate risks, validate fixes, and provide clear, prioritized recommendations.",
    Icon: FileSearch,
    plateBg: "bg-sky-50",
    plateRing: "ring-sky-100",
    iconText: "text-sky-600/90",
    gradFrom: "from-sky-400",
    gradTo: "to-cyan-400",
  },
  {
    title: "Blockchain Certificate (NFT)",
    desc:
      "Mint a verifiable, on-chain security certificate as an NFT—proof of audit you can share with users & partners. Includes metadata for audit scope, date, and hash of findings.",
    badge: "Coming soon",
    Icon: BadgeCheck,
    plateBg: "bg-violet-50",
    plateRing: "ring-violet-100",
    iconText: "text-violet-600/90",
    gradFrom: "from-violet-400",
    gradTo: "to-fuchsia-400",
  },
];

export default function WhatWeDo(): React.ReactElement {
  const prefersReduced = useReducedMotion();

  // ✅ Explicitly type variant objects so TS knows `variants` is valid.
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
    <section id="about" className="relative overflow-hidden bg-white py-24">
      {/* 3D backdrop (falls back to glossy torus if model is missing) */}
      <ThreeJsBackdrop modelPath="/models/network.glb" />

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
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
            What We Do
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Ship faster, safer. No guesswork.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            From self-serve hardening to expert-led reviews—and soon, verifiable on-chain certificates—AuditDApps
            helps you catch issues early and prove security with confidence.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {services.map(({ title, desc, badge, Icon, plateBg, plateRing, iconText, gradFrom, gradTo }) => (
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
                <span className="absolute -top-2 right-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                  {badge}
                </span>
              )}

              {/* Icon plate with per-card palette */}
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

              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>

              {/* Bottom accent gradient matches card palette */}
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
}
