import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Shield,
  Mail,
  CheckCircle2,
  XCircle,
  Info,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<null | { ok: boolean; msg: string }>(null);
  const [cooldown, setCooldown] = useState(0); // seconds until resend enabled

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canSend = emailOk && !sending && cooldown === 0;

  // simple cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    setSending(true);
    setBanner(null);

    try {
      const redirectTo = `${window.location.origin}/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        setBanner({ ok: false, msg: error.message || "Could not send reset email." });
      } else {
        setBanner({
          ok: true,
          msg: "Check your inbox—we’ve sent a secure link to reset your password.",
        });
        setCooldown(30); // 30s resend cooldown
      }
    } catch (err) {
      setBanner({ ok: false, msg: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border bg-white/90 backdrop-blur-xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-indigo-600 text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Reset your password</h1>
              <p className="text-sm text-slate-500">
                Enter the email you use for AuditDapps and we’ll send a secure reset link.
              </p>
            </div>
          </div>

          {/* Banners */}
          {banner && banner.ok && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              <span>{banner.msg}</span>
            </div>
          )}
          {banner && !banner.ok && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-100" role="alert">
              <XCircle className="h-4 w-4" />
              <span>{banner.msg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pl-10 text-[15px] outline-none ring-blue-500/30 focus:ring-2"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {!emailOk && email.length > 0 && (
                <p className="mt-1 text-xs text-amber-600">Enter a valid email.</p>
              )}
            </div>

            <button
              disabled={!canSend}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              {sending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Send reset link"}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-4 flex items-start gap-2 text-xs text-slate-600">
            <Info className="mt-0.5 h-4 w-4 text-slate-400" />
            <p>
              If you don’t see the email in a minute, check your spam or promotions folder. Still no
              luck? Add <span className="font-medium">no-reply@supabase.io</span> to your contacts and try again.
            </p>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <a
              href="/login"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </a>
            <a href="/contact" className="text-blue-600 hover:underline">
              Need help?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
