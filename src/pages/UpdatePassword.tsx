// src/pages/UpdatePassword.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";

type Strength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  bar: string;     // width class
  color: string;   // text/bg class
};

function getStrength(pw: string): Strength {
  const len = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum   = /[0-9]/.test(pw);
  const hasSym   = /[^A-Za-z0-9]/.test(pw);

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if ([hasLower, hasUpper].filter(Boolean).length === 2) score++;
  if (hasNum && hasSym) score++;

  const map: Record<number, Strength> = {
    0: { score: 0, label: "Very weak", bar: "w-[8%]",  color: "bg-rose-500 text-rose-600" },
    1: { score: 1, label: "Weak",      bar: "w-1/4",    color: "bg-rose-500 text-rose-600" },
    2: { score: 2, label: "Fair",      bar: "w-2/4",    color: "bg-amber-500 text-amber-600" },
    3: { score: 3, label: "Good",      bar: "w-3/4",    color: "bg-emerald-500 text-emerald-600" },
    4: { score: 4, label: "Strong",    bar: "w-full",   color: "bg-emerald-600 text-emerald-700" },
  };

  return map[Math.min(score, 4)];
}

export default function UpdatePassword() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [caps, setCaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const strength = useMemo(() => getStrength(pw), [pw]);
  const goodToSubmit =
    strength.score >= 3 && pw.length >= 8 && pw === pw2 && !loading;

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    })();
  }, []);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // hint if caps lock is on
    // Some browsers support getModifierState on key events
    if (typeof e.getModifierState === "function") {
      setCaps(e.getModifierState("CapsLock"));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodToSubmit) return;

    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    setOk(true);
    // brief success pause, then send to login
    setTimeout(() => navigate("/login"), 1500);
  };

  // No session (opened directly, not from email link)
  if (hasSession === false) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="w-full max-w-md rounded-2xl border bg-white/90 backdrop-blur shadow-xl p-8">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="h-5 w-5 text-rose-600" />
            <h2 className="text-lg font-semibold">Reset link required</h2>
          </div>
          <p className="text-sm text-slate-600">
            Please open this page using the secure link we emailed you.
          </p>
          <a
            href="/forgot-password"
            className="mt-4 inline-flex text-sm text-blue-600 hover:underline"
          >
            Request a new reset link
          </a>
        </div>
      </div>
    );
  }

  // Loading session check
  if (hasSession === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center py-10">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="relative rounded-2xl border bg-white/90 backdrop-blur-xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-indigo-600 text-white shadow-sm">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                Set a new password
              </h1>
              <p className="text-sm text-slate-500">
                Make it strong—this protects your organization’s data.
              </p>
            </div>
          </div>

          {/* Success banner */}
          {ok && (
            <div
              className="mt-4 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Password updated! Redirecting…</span>
            </div>
          )}

          {/* Error */}
          {!!err && (
            <div
              className="mt-4 mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-100"
              role="alert"
            >
              <XCircle className="h-4 w-4" />
              <span>{err}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="mt-4 space-y-4">
            {/* New password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyUp={onKey}
                  onKeyDown={onKey}
                  className="peer w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-[15px] outline-none ring-blue-500/30 focus:ring-2"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Strength / helper */}
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-1.5 rounded-full transition-all ${strength.bar} ${strength.color.split(" ")[0]}`}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span className={strength.color.split(" ")[1]}>
                    {strength.label}
                  </span>
                  {caps && (
                    <span className="text-amber-600">Caps Lock is on</span>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <Req ok={pw.length >= 8} label="At least 8 characters" />
                <Req ok={/[A-Z]/.test(pw)} label="One uppercase letter" />
                <Req ok={/[a-z]/.test(pw)} label="One lowercase letter" />
                <Req ok={/[0-9]/.test(pw)} label="One number" />
                <Req ok={/[^A-Za-z0-9]/.test(pw)} label="One symbol" />
              </ul>
            </div>

            {/* Confirm */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showPw2 ? "text" : "password"}
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="peer w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-[15px] outline-none ring-blue-500/30 focus:ring-2"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPw2 ? "Hide password" : "Show password"}
                >
                  {showPw2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {pw2 && pw !== pw && ( // defensive
                <p className="mt-1 text-xs text-rose-600">Passwords do not match.</p>
              )}
              {pw2 && pw !== pw2 && (
                <p className="mt-1 text-xs text-rose-600">Passwords do not match.</p>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={!goodToSubmit}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="h-5 w-5" />
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>

        {/* Small footer link */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Back to{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-2 rounded-md border px-2 py-1 ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <LockKeyhole className="h-4 w-4 shrink-0" />
      )}
      <span>{label}</span>
    </li>
  );
}
