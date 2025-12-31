import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";


const EmailConfirmed: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const next = searchParams.get("next") || "/dashboard";
    const [checking, setChecking] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
    (async () => {
        const { data } = await supabase.auth.getUser();
        setIsAuthed(!!data?.user);
        setChecking(false);
    })();
    }, []);

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-white">
      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-start px-4 pt-16 pb-24">
        <section className="w-full rounded-2xl border border-slate-200 bg-white/90 shadow-md backdrop-blur-sm px-8 py-8 md:px-12 md:py-10">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <svg
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 3.25 5.5 5.5v6.14c0 4.02 2.76 7.73 6.5 8.86 3.74-1.13 6.5-4.84 6.5-8.86V5.5L12 3.25Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M9.25 12.25 11 14l3.5-3.75"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Audit DApps
              </p>
              <p className="text-sm font-medium text-slate-800">
                Email verified successfully
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
            <div>
              <h1 className="mb-3 text-2xl md:text-3xl font-semibold text-slate-900">
                Your account is now active 🎉
              </h1>

              <p className="mb-3 text-sm md:text-base leading-relaxed text-slate-700">
                Thanks for confirming your email. Your Audit DApps account has
                been successfully activated, and you can now sign in securely
                using your credentials.
              </p>

              <p className="mb-6 text-xs md:text-sm leading-relaxed text-slate-500">
                For your security, this verification link can only be used once.
                If you didn’t create this account, you can safely ignore this
                email — no further action is required.
              </p>

              {/* Single action */}
              <div className="mt-4">
                {checking ? (
                    <div className="text-sm text-slate-600">Checking session…</div>
                ) : isAuthed ? (
                    <button
                    onClick={() => navigate(next, { replace: true })}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                    Continue
                    </button>
                ) : (
                    <Link to={`/login?next=${encodeURIComponent(next)}`}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                    Continue
                    </Link>
                )}
                </div>

            </div>

            {/* Side Help Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-xs md:text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">
                Having trouble signing in?
              </p>
              <p className="mb-2">
                Make sure you’re using the same email address you used during
                registration.
              </p>
              <p>
                Still stuck?{" "}
                <a
                  href="mailto:support@auditdapps.com"
                  className="font-medium text-blue-700 hover:text-blue-600"
                >
                  Contact support
                </a>{" "}
                and include the email address you registered with so we can help
                you quickly.
              </p>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default EmailConfirmed;
