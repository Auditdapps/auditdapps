import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const year = new Date().getFullYear();

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Start Audit", href: "/self-audit" }, // or your CTA route
];

export default function Footer() {
  return (
    <footer className="relative mt-16 bg-[#0a1f44] text-white">
      {/* Subtle top accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-12 mx-auto h-24 max-w-5xl bg-gradient-to-b from-white/10 to-transparent blur-2xl"
        />

        <div className="pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
            {/* Brand / About */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/90 grid place-items-center ring-1 ring-white/10 shadow">
                  <span className="text-white font-bold">AD</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Audit Dapps</h3>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                Audit Dapps is your trusted security companion. We simplify the process of securing
                decentralized apps with practical guidance and self-audit tooling. Whether you’re a
                seasoned developer or just starting out, we’ll help you ship safer, faster.
              </p>

              {/* Socials */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  aria-label="Facebook"
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <FaFacebookF className="text-white text-lg" />
                </a>
                <a
                  href="https://twitter.com"
                  aria-label="Twitter"
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <FaTwitter className="text-white text-lg" />
                </a>
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <FaInstagram className="text-white text-lg" />
                </a>
              </div>
            </div>

            {/* Quick Links (from your top nav) */}
            <div className="lg:col-span-4">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                {QUICK_LINKS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="group inline-flex items-center gap-2 hover:text-white transition"
                    >
                      <span className="inline-block h-[6px] w-[6px] rounded-full bg-white/20 group-hover:bg-white/60" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal / Resources */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
              </ul>

              {/* Mini CTA */}
              <div className="mt-6 rounded-lg bg-white/5 ring-1 ring-white/10 p-4">
                <p className="text-sm text-gray-200">
                  Ready to harden your dapp? Start a free{" "}
                  <a href="/self-audit" className="underline decoration-indigo-400 hover:text-white">
                    self-audit
                  </a>{" "}
                  today.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400">
              <p>
                &copy; {year} Audit Dapps. All Rights Reserved.
              </p>
              <p className="text-gray-400">
                Built for web3 teams that care about security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
