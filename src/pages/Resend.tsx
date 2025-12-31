// src/pages/Resend.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

function isValidEmail(value: string) {
  // Keep it simple and let the browser also enforce `type="email"`
  const email = value.trim();
  // Basic sanity check to avoid obvious mistakes before network call
  return !!email && /.+@.+\..+/.test(email);
}

function errorToFriendlyMessage(err: unknown) {
  // Supabase Auth can surface different shapes; normalize to string message
  const msg =
    typeof err === "string"
      ? err
      : (err as { message?: string })?.message || "Something went wrong.";

  // Common Supabase OTP scenarios
  if (/over[_ ]?email[_ ]?send[_ ]?rate[_ ]?limit/i.test(msg) || /rate limit/i.test(msg)) {
    return "You’ve requested too many emails in a short time. Please try again in a couple of minutes.";
  }
  if (/user[_ ]?not[_ ]?found/i.test(msg) || /no user/i.test(msg)) {
    return "We couldn’t find an account with that email. Double-check the address or sign up first.";
  }
  if (/fetch/i.test(msg) || /network/i.test(msg)) {
    return "Network error while contacting the server. Please check your connection and try again.";
  }
  return msg;
}

export default function Resend() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const isMounted = useRef(true);

  // Resolve redirect target safely: optional env override, then sane default
  const redirectTo = useMemo(() => {
    const env = (import.meta as any)?.env?.VITE_AUTH_REDIRECT_URL as string | undefined;
    // Ensure we always point back to our own origin if env is missing
    return env?.trim() || `${window.location.origin}/email-confirmed`;
  }, []);

  // Autofill email from localStorage or URL (?email=)
  useEffect(() => {
    const saved = localStorage.getItem("pending_signup_email");
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("email");
    if (fromQuery && isValidEmail(fromQuery)) setEmail(fromQuery.trim());
    else if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        toast.error(errorToFriendlyMessage(error));
        return;
      }

      toast.success("Confirmation email resent. Check your inbox (and spam).");
      // Optional: keep it for convenience, or clear for privacy.
      localStorage.removeItem("pending_signup_email");
    } catch (err) {
      toast.error(errorToFriendlyMessage(err));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-white to-gray-50 px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-20 relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-5 bg-no-repeat bg-center bg-cover pointer-events-none" />

      {/* Animated card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full z-10 text-center relative"
        role="region"
        aria-label="Resend confirmation"
      >
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-2xl shadow-xl bg-blue-500 opacity-10 blur-2xl pointer-events-none" />

        {/* Icon badge */}
        <div className="bg-blue-100 p-3 rounded-full mx-auto mb-4 w-14 h-14 flex items-center justify-center shadow relative z-10">
          <MailCheck className="text-blue-600 w-8 h-8" strokeWidth={2} aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">
          Resend Confirmation
        </h1>
        <p className="text-sm text-gray-600 mb-6 relative z-10">
          Enter your email and we’ll resend the confirmation link.
        </p>

        <form onSubmit={handleResend} className="space-y-4 text-left relative z-10" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p id="email-help" className="mt-1 text-xs text-gray-500">
              Use the email you registered with. We’ll send a fresh confirmation link.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            aria-disabled={loading || !email.trim()}
            aria-busy={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            )}
            {loading ? "Sending..." : "Resend Email"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 relative z-10">
          We respect your privacy. No spam, ever.
        </p>

        <p className="text-sm text-gray-500 mt-4 relative z-10">
          Back to{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>

        {/* Live region for assistive tech */}
        <div className="sr-only" aria-live="polite" aria-atomic="true" />
      </motion.div>
    </div>
  );
}
