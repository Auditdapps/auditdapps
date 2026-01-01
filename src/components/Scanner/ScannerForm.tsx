// src/components/Scanner/ScannerForm.tsx
import SourceInput from "./SourceInput";
import type { ChainKey } from "@/lib/explorers";

export type ScannerMode = "explorer" | "manual";

export type SubmittedManualSource = {
  sourceCode: string;
  compilerVersion?: string;
  contractName?: string;
};

type Props = {
  // modes
  mode: ScannerMode;
  onModeChange: (m: ScannerMode) => void;

  // explorer path
  chain: ChainKey;
  address: string;
  onChainChange: (c: ChainKey) => void;
  onAddressChange: (v: string) => void;

  // manual path
  manual: SubmittedManualSource | null;
  onManualChange: (m: SubmittedManualSource | null) => void;

  // action/state
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
};

export default function ScannerForm({
  mode,
  onModeChange,
  chain,
  address,
  onChainChange,
  onAddressChange,
  manual,
  onManualChange,
  onSubmit,
  disabled,
  loading,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 md:p-6 shadow-sm">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "explorer" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
          onClick={() => onModeChange("explorer")}
          disabled={loading}
        >
          Fetch from Explorer
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "manual" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
          onClick={() => onModeChange("manual")}
          disabled={loading}
        >
          Paste / Upload Source
        </button>
      </div>

      {mode === "explorer" ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label htmlFor="scanner-network" className="mb-1 block text-sm text-slate-600">
              Network
            </label>
            <select
              id="scanner-network"
              value={chain}
              onChange={(e) => onChainChange(e.target.value as ChainKey)}
              className="w-full rounded border px-3 py-2"
              disabled={loading}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="bsc">BNB Smart Chain</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="scanner-address" className="mb-1 block text-sm text-slate-600">
              Contract address
            </label>
            <input
              id="scanner-address"
              placeholder="0x..."
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
              autoComplete="off"
              disabled={loading}
            />
          </div>
        </div>
      ) : (
        <SourceInput value={manual} onChange={onManualChange} disabled={loading} />
      )}


      <div className="mt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading}
          className={`rounded-md px-5 py-2 font-semibold ${
            !disabled && !loading ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"
          }`}
        >
          {loading ? "Analyzing…" : "Scan"}
        </button>
      </div>
    </div>
  );
}
