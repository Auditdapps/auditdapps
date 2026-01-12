export default function AdminSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-600">
          System tools and health checks live here. We’ll add Stripe / webhook health and site config next.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Coming next</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>Stripe health: last webhook received, portal status, active prices</li>
          <li>Admin feature flags and site config</li>
          <li>Export tooling for GTV evidence (CSV / PDF summaries)</li>
        </ul>
      </div>
    </div>
  );
}
