// src/components/RiskAnalytics.tsx
import { Bar, Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import type { FC } from "react";

interface HeatCell {
  pct: number;
  count: number;
  sevLabel: string;
  likeLabel: string;
}

interface TableRow {
  id: string;
  finding: string;
  severityLabel: string;
  sevScore: number;
  likelihoodLabel: string;
  likeScore: number;
  mitigationLabel: string;
  mitFactor: number;
  formula: string;
  status: string;
}

interface RiskAnalyticsProps {
  totalAdjusted: number;
  totalMax: number;
  overallPct: number;
  centerColor: string;   // not used in this view
  trafficText: string;   // not used in this view
  trend: unknown;        // not used in this view
  heatRows: HeatCell[][];
  LIKES: string[];
  SEVS: string[];
  hueForPct: (value: number) => string;
  barData: ChartData<"bar">;
  barOptions: ChartOptions<"bar">;
  lineData: ChartData<"line">;
  lineOptions: ChartOptions<"line">;
  tableRows: TableRow[];
}

const RiskAnalytics: FC<RiskAnalyticsProps> = ({
  totalAdjusted,
  totalMax,
  overallPct,
  centerColor: _centerColor, // prefix unused props to appease lint
  trafficText: _trafficText,
  trend: _trend,
  heatRows,
  LIKES,
  SEVS,
  hueForPct,
  barData,
  barOptions,
  lineData,
  lineOptions,
  tableRows,
}) => {
  return (
    <>
      {/* ===== Heatmap ===== */}
      <div className="grid grid-cols-1 gap-6 mb-8 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Risk Matrix (Impact × Likelihood)
          </h3>

          <div className="grid grid-cols-[auto_repeat(5,minmax(80px,1fr))] gap-2 text-xs font-medium text-gray-700 mb-2">
            <div className="col-span-1" />
            {LIKES.map((l) => (
              <div key={l} className="text-center">
                {l}
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            {heatRows.map((row, rIdx) => (
              <div
                key={SEVS[rIdx] ?? String(rIdx)} // stable key instead of index
                className="grid grid-cols-[auto_repeat(5,minmax(80px,1fr))] gap-2 items-center"
              >
                <div className="text-xs font-medium text-gray-700">
                  {SEVS[rIdx]}
                </div>
                {row.map((cell, cIdx) => (
                  <div
                    key={`${SEVS[rIdx] ?? rIdx}-${LIKES[cIdx] ?? cIdx}`} // stable composite key
                    className="rounded-md h-10 flex items-center justify-center text-[11px] font-semibold text-white"
                    style={{ backgroundColor: hueForPct(cell.pct) }}
                    title={`${cell.sevLabel} × ${cell.likeLabel} – ${Math.round(
                      cell.pct * 100
                    )}% (${cell.count} item${cell.count === 1 ? "" : "s"})`}
                    aria-label={`${cell.sevLabel} × ${cell.likeLabel}: ${Math.round(
                      cell.pct * 100
                    )}% with ${cell.count} items`}
                  >
                    {Math.round(cell.pct * 100)}% ({cell.count})
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-600">
            Cells reflect <span className="font-medium">residual risk</span> for each
            combination: (Severity×Likelihood×Mitigation) / (Severity×5×1). Darker red =
            higher risk.
          </p>
        </div>
      </div>

      {/* ===== Stacked Bar ===== */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Mitigation Status by Severity
          </h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} aria-label="Mitigation Status Chart" />
          </div>
          <p className="mt-3 text-xs text-gray-600 text-center">
            Bars show <span className="font-medium">counts</span> of findings by mitigation.
            (None = Unmitigated, Partial = In Progress, Full = Resolved)
          </p>
        </div>
      </div>

      {/* ===== Trend Line ===== */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Risk Trend (last runs)
          </h3>
          <div className="h-56">
            <Line data={lineData} options={lineOptions} aria-label="Risk Trend Chart" />
          </div>
          <p className="mt-3 text-xs text-gray-600 text-center">
            Normalized risk over time. Use this to verify improvements (↓) or regressions (↑)
            across audits/runs.
          </p>
        </div>
      </div>

      {/* ===== Structured Risk Table ===== */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Findings (Scored & Normalized)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Risk ID</th>
                  <th className="py-2 pr-4">Finding</th>
                  <th className="py-2 pr-4">Severity</th>
                  <th className="py-2 pr-4">Likelihood</th>
                  <th className="py-2 pr-4">Mitigation</th>
                  <th className="py-2 pr-4">Score (S×L×M)</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={7}>
                      No findings extracted.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{r.id}</td>
                      <td className="py-2 pr-4">{r.finding}</td>
                      <td className="py-2 pr-4">
                        {r.severityLabel} ({r.sevScore})
                      </td>
                      <td className="py-2 pr-4">
                        {r.likelihoodLabel} ({r.likeScore})
                      </td>
                      <td className="py-2 pr-4">
                        {r.mitigationLabel} ({r.mitFactor})
                      </td>
                      <td className="py-2 pr-4">{r.formula}</td>
                      <td className="py-2 pr-4">{r.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            <span className="font-medium">Total:</span> {totalAdjusted.toFixed(2)} / {totalMax.toFixed(2)} = {overallPct}% normalized.
          </p>
        </div>
      </div>
    </>
  );
};

export default RiskAnalytics;
