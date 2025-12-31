// src/components/DbWakeGate.tsx
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  children: ReactNode;
  table?: string;            // accepts a plain string; we cast when calling .from(...)
  rpc?: string;              // optional RPC name (e.g. "ping")
  maxRetries?: number;
  mode?: "auto" | "none";    // "none" = skip wake check
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type MaybeErr = { status?: number; cause?: { status?: number }; message?: unknown };

function isLikelySleeping(err: unknown) {
  const e = (err ?? {}) as MaybeErr;
  const status = e.status ?? e.cause?.status;
  const msg = String(e.message ?? "").toLowerCase();
  return (
    [502, 503, 504].includes(Number(status)) ||
    /fetch|network|timeout|failed to fetch/.test(msg)
  );
}

export default function DbWakeGate({
  children,
  table,
  rpc,
  maxRetries = 8,
  mode = "auto",
}: Props) {
  const [state, setState] =
    useState<"checking" | "waking" | "awake" | "error">("checking");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Skip entirely if asked
  if (mode === "none") return <>{children}</>;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // If neither table nor rpc is provided, just render
      if (!table && !rpc) {
        setState("awake");
        return;
      }

      setState("checking");
      let attempt = 0;

      while (!cancelled && attempt <= maxRetries) {
        try {
          let error: unknown = null;

          // ---------- Typed RPC helper (as requested) ----------
          type RpcCaller = (
            fn: string,
            args?: Record<string, unknown>
          ) => Promise<{ data: unknown; error: { message?: string } | null }>;
          const callRpc = (supabase.rpc as unknown as RpcCaller);
          // -----------------------------------------------------

          if (rpc) {
            const { error: rpcError } = await callRpc(rpc);
            error = rpcError ?? null;
          } else if (table) {
            // Narrowed cast for .from() so we can pass a plain string name
            type FromCaller = (
              t: string
            ) => {
              select: (
                columns: string,
                opts?: { head?: boolean; count?: "exact" | "planned" | "estimated" }
              ) => {
                limit: (
                  n: number
                ) => Promise<{ error: { message?: string } | null }>;
              };
            };
            const from = (supabase.from as unknown as FromCaller)(table);
            const res = await from
              .select("*", { head: true, count: "estimated" })
              .limit(1);
            error = res.error ?? null;
          }

          if (error) throw error;

          if (!cancelled) {
            setState("awake");
            setErrMsg(null);
          }
          return;
        } catch (e) {
          attempt++;

          // give up if it doesn't look like "sleep"
          if (!isLikelySleeping(e) || attempt > maxRetries) {
            if (!cancelled) {
              const m = (e as MaybeErr)?.message;
              setState("error");
              setErrMsg(typeof m === "string" ? m : "Database unavailable");
            }
            return;
          }

          if (!cancelled) setState("waking");
          const delay = Math.min(6500, 500 * Math.pow(1.5, attempt));
          await sleep(delay);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [table, rpc, maxRetries]);

  if (state === "awake") return <>{children}</>;

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      aria-live="polite"
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        {state !== "error" ? (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <h2 className="text-lg font-semibold">Loading…</h2>
            
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-red-600">
              Can&apos;t reach database
            </h2>
            <p className="mt-2 text-sm text-gray-600">{errMsg}</p>
            <button
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
