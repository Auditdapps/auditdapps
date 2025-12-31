import React, { useMemo, useState } from "react";

// --- Types ---
type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "open" | "completed" | "all";

type Recommendation = {
  id: string;
  title: string;
  severity: Severity;
  rationale?: string;
  status: Status;
  meta?: {
    checks?: string[];
  };
};

type TailoredActionsProps = {
  recommendations?: Recommendation[];
  onToggleStatus: (id: string, nextStatus: Status) => void;
  limit?: number;
  showFilters?: boolean;
};

// --- Main Component ---
const TailoredActions: React.FC<TailoredActionsProps> = ({
  recommendations = [],
  onToggleStatus,
  limit = 6,
  showFilters = true,
}) => {
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [statusFilter, setStatusFilter] = useState<Status>("open");

  const filtered = useMemo(() => {
    return recommendations
      .filter((r) => (severityFilter === "All" ? true : r.severity === severityFilter))
      .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
      .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
      .slice(0, limit);
  }, [recommendations, severityFilter, statusFilter, limit]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tailored, actionable recommendations</h3>
          <p className="text-sm text-slate-600">Prioritized by severity. Mark items done as you go.</p>
        </div>

        {showFilters && (
          <div className="flex gap-2">
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as Severity | "All")}
            >
              {["All", "Critical", "High", "Medium", "Low"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status)}
            >
              <option value="open">Open</option>
              <option value="completed">Completed</option>
              <option value="all">All</option>
            </select>
          </div>
        )}
      </div>

      <ul className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <li className="text-sm text-slate-500">Nothing to show with current filters.</li>
        ) : (
          filtered.map((rec) => (
            <li key={rec.id} className="rounded-xl border border-slate-200 p-4 flex items-start gap-3">
              <SeverityPill severity={rec.severity} />
              <div className="flex-1">
                <p className="font-medium">{rec.title}</p>
                {rec.rationale && <p className="mt-1 text-sm text-slate-600">{rec.rationale}</p>}
                {Array.isArray(rec.meta?.checks) && rec.meta.checks.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-1">
                    {rec.meta.checks.map((c, idx) => <li key={idx}>{c}</li>)}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  rec.status === "open"
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                }`}>
                  {rec.status}
                </span>
                <button
                  onClick={() => onToggleStatus(rec.id, rec.status === "open" ? "completed" : "open")}
                  className={`text-xs rounded-md px-3 py-1 font-semibold ${
                    rec.status === "open"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                  }`}
                >
                  {rec.status === "open" ? "Mark completed" : "Reopen"}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

// --- Severity Pill ---
const SeverityPill: React.FC<{ severity: Severity }> = ({ severity }) => {
  const map: Record<Severity, string> = {
    Critical: "bg-rose-100 text-rose-700 ring-rose-200",
    High: "bg-orange-100 text-orange-700 ring-orange-200",
    Medium: "bg-amber-100 text-amber-700 ring-amber-200",
    Low: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ring-1 ${map[severity]}`}>
      {severity}
    </span>
  );
};

// --- Utility function ---
function severityRank(s: Severity): number {
  switch (s) {
    case "Critical": return 0;
    case "High": return 1;
    case "Medium": return 2;
    case "Low": return 3;
    default: return 4;
  }
}

export default TailoredActions;
