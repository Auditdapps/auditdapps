// src/pages/PaymentSuccess.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const REDIRECT_SECONDS = 8;

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    const timeout = setTimeout(() => {
      navigate("/dashboard");
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex justify-center px-6 py-16">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl border border-sky-100 p-10 md:p-16">

        {/* Success Icon */}
        <div className="flex justify-center mb-10">
          <div className="h-24 w-24 rounded-full bg-emerald-50 shadow-inner flex items-center justify-center">
            <svg
              className="h-14 w-14 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="11"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M8 12.5L11 15.5L17 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Payment successful 🎉
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your premium access has been activated. You’ll be redirected to your
            dashboard where you can view audits, AI recommendations, and certificates.
          </p>
        </div>

        {/* Countdown */}
        <div className="mt-10 text-center text-base text-slate-500">
          Redirecting to your dashboard in{" "}
          <span className="font-semibold text-slate-800">
            {secondsLeft}s
          </span>
          …
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 rounded-full bg-indigo-600 text-white text-base font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            Go to dashboard now
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-full border border-slate-200 bg-white text-slate-700 text-base font-medium shadow-sm hover:bg-slate-50 transition"
          >
            Back to home
          </button>
        </div>

        {/* Session ID */}
        {sessionId && (
          <div className="mt-12 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500 mb-2">Payment reference</p>
            <div className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 break-all">
              {sessionId}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="mt-12 text-center text-[13px] text-slate-400">
          If you believe there’s an issue with your payment or premium access,
          please contact support.
        </p>
      </div>
    </div>
  );
}
