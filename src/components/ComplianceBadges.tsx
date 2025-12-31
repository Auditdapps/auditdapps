// src/components/ComplianceLogos.tsx
import * as React from "react";

type Logo = { src: string; name: string; invertInDark?: boolean };

const logos: Logo[] = [
  { src: "/logos/nist.png",          name: "NIST",          invertInDark: true },
  { src: "/logos/iso-iec-27001.png", name: "ISO/IEC 27001", invertInDark: true },
  { src: "/logos/owasp.png",         name: "OWASP",         invertInDark: true },
  { src: "/logos/cis.png",           name: "CIS",           invertInDark: true },
  { src: "/logos/gdpr.png",          name: "GDPR",          invertInDark: true },
];

type Props = {
  className?: string;
  /** Seconds to complete one loop (bigger = slower). Default 28s */
  speed?: number;
  /** Set false to render the old static grid */
  animate?: boolean;
};

export default function ComplianceLogos({
  className = "",
  speed = 28,
  animate = true,
}: Props) {
  // Duplicate the list to create a seamless loop
  const items = React.useMemo(() => [...logos, ...logos], []);

  if (!animate) {
    // Fallback: your original static grid
    return (
      <section aria-label="Security frameworks and standards" className={className}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
            {logos.map((l) => (
              <li key={l.name} className="flex">
                <Pill>
                  <img
                    src={l.src}
                    alt={l.name}
                    loading="lazy"
                    decoding="async"
                    className={[
                      "max-h-10 md:max-h-12 w-auto object-contain select-none pointer-events-none",
                      l.invertInDark ? "dark:invert" : "",
                    ].join(" ")}
                  />
                </Pill>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  // Animated marquee
  return (
    <section aria-label="Security frameworks and standards" className={className}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden py-2">
          <div
            className="marquee flex items-center gap-4 md:gap-6 will-change-transform"
            style={{ ["--duration" as any]: `${speed}s` }}
            aria-hidden="true"
          >
            {items.map((l, i) => (
              <div key={`${l.name}-${i}`} className="shrink-0">
                <Pill title={l.name}>
                  <img
                    src={l.src}
                    alt={l.name}
                    loading="lazy"
                    decoding="async"
                    className={[
                      "max-h-10 md:max-h-12 w-auto object-contain select-none pointer-events-none",
                      l.invertInDark ? "dark:invert" : "",
                    ].join(" ")}
                  />
                </Pill>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local CSS for the marquee animation */}
      <style>{`
        .marquee {
          width: max-content;
          animation: logos-scroll var(--duration, 28s) linear infinite;
        }
        .marquee:hover { animation-play-state: paused; }
        @keyframes logos-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Respect system preferences */
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}

/** Reusable pill wrapper to keep sizing consistent */
function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div
      title={title}
      className="
        h-16 md:h-20 w-[220px] md:w-[250px]
        rounded-full bg-white ring-1 ring-slate-200 shadow-sm
        dark:bg-slate-900 dark:ring-white/10
        flex items-center justify-center
      "
    >
      {children}
    </div>
  );
}
