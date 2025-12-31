// src/pages/Home.tsx
import Hero from "../components/Hero";
import WhatWeDo from "../components/WhatWeDo";
import BestService from "../components/BestService";
import AuditCycle from "../components/AuditCycle";
import ComplianceBadges from "../components/ComplianceBadges";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <BestService />
      <AuditCycle />

      {/* Trust badges row */}
      <section className="py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ComplianceBadges />
        </div>
      </section>
    </>
  );
}
