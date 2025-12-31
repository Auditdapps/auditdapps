// src/components/AuditCycle.tsx
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import ThreeJsBackdrop from "./ThreeJsBackdrop";

import icon1 from "../assets/img/development.png";
import icon2 from "../assets/img/audit.png";
import icon3 from "../assets/img/recommendation.png";
import icon4 from "../assets/img/certificate.png";

type Step = { id: number; icon: string; title: string; desc: string };

export default function AuditCycle() {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out" });
  }, []);

  const steps: Step[] = [
    { id: 1, icon: icon1, title: "DApps Project Development", desc: "Set up your project and initialize a new audit using our guided, best-practice workflow." },
    { id: 2, icon: icon2, title: "Audit with Audit Dapps", desc: "Run automated checks and structured reviews to surface real security risks—not noise." },
    { id: 3, icon: icon3, title: "Implement Recommendations", desc: "Get prioritized, actionable fixes. Track progress until all high-impact issues are closed." },
    { id: 4, icon: icon4, title: "Request Certification", desc: "Validate the final state and receive an official certificate to share with users & partners." },
  ];

  // ✅ Type the variants
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const card: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 18, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-b from-white to-sky-50/60 py-16">
      <ThreeJsBackdrop modelPath="/models/shield.glb" />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-28 mx-auto h-48 max-w-5xl rounded-full bg-gradient-to-b from-indigo-200/40 to-transparent blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-200/50 to-transparent blur-2xl" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100" data-aos="fade-up">
            Working Cycle
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" data-aos="fade-up">
            Our Audit Cycle
          </h2>
          <p className="mt-3 text-slate-600" data-aos="fade-up">
            A clear, repeatable path from project setup to shareable proof of security—built for modern web3 teams.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s, i) => (
            <motion.article
              key={s.id}
              variants={card}
              whileHover={{ y: -6, rotateX: prefersReduced ? 0 : 2, rotateY: prefersReduced ? 0 : -2 }}
              className="group relative rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur transition"
            >
              <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Step {i + 1}
              </div>

              <div className="mb-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 transition group-hover:bg-indigo-100">
                  <img src={s.icon} alt="" className="h-8 w-8 object-contain opacity-90" loading="lazy" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              <div className="mt-4 h-[3px] w-16 rounded bg-gradient-to-r from-indigo-400 to-sky-400 opacity-70 transition group-hover:w-24" />

              {i < steps.length - 1 && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute right-[-18px] top-12 hidden h-px w-10 bg-gradient-to-r from-slate-200 to-transparent lg:block"
                  initial={{ opacity: 0, width: 0 }}
                  whileInView={{ opacity: 1, width: 40 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                />
              )}
            </motion.article>
          ))}
        </motion.div>

        {/* CTA: matches navbar color */}
        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/self-audit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Start a Free Self-Audit
          </a>
          <a
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-50"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
