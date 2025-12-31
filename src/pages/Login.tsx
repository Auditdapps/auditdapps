import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getRole } from "../utils/auth";
import {
  LogIn,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  Github,
  Chrome,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const EMAIL_KEY = "ad:login:email";

export default function Login() {
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!localStorage.getItem(EMAIL_KEY));
  const [showPw, setShowPw] = useState(false);
  const [caps, setCaps] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const nextParam = new URLSearchParams(location.search).get("next");
  const registerUrl = nextParam
  ? `/register?next=${encodeURIComponent(nextParam)}`
  : "/register";

  // simple validation
  const valid = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(email);
    return okEmail && password.length >= 6 && !loading;
  }, [email, password, loading]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCaps(e.getModifierState("CapsLock"));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (remember) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);

    const { data: u } = await supabase.auth.getUser();
    const role = getRole(u?.user);

    // respect ?next=... when coming from self-audit/login flow
    const nextParam = new URLSearchParams(location.search).get("next");
    const dest = nextParam || (role === "admin" ? "/admin" : "/dashboard");

    setOk(true);
    setTimeout(() => navigate(dest, { replace: true }), 600);
  };

  const loginWithProvider = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signInWithOAuth({ provider });
    } catch (e: any) {
      setError(e?.message || "OAuth sign-in failed");
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center py-4 px-4">
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border bg-white/95 backdrop-blur-xl shadow-2xl p-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-indigo-600 text-white shadow-sm">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Login</h1>
              <p className="text-sm text-slate-500">Welcome back. Let’s secure some dapps.</p>
            </div>
          </div>

          {/* Success/Error banners */}
          {ok && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              <span>Signed in — redirecting…</span>
            </div>
          )}
          {!!error && (
            <div
              className="mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-100"
              role="alert"
            >
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyUp={onKey}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pl-10 text-[15px] outline-none ring-blue-500/30 focus:ring-2"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={onKey}
                  onKeyDown={onKey}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pl-10 pr-10 text-[15px] outline-none ring-blue-500/30 focus:ring-2"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {caps && <p className="mt-1 text-xs text-amber-600">Caps Lock is on</p>}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember my email
              </label>
              <Link to={registerUrl} className="text-sm text-slate-600 hover:underline">
                Need an account?
              </Link>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!valid}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* OAuth */}
          <div className="grid gap-3">
            <button
              onClick={() => loginWithProvider("google")}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Chrome className="h-4 w-4" />
              Login with Google
            </button>
            <button
              onClick={() => loginWithProvider("github")}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
            >
              <Github className="h-4 w-4" />
              Login with GitHub
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Problems signing in?{" "}
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Reset your password
          </a>
        </p>
      </div>
    </div>
  );
}
