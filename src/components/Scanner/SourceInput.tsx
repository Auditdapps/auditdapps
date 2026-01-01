// src/components/Scanner/SourceInput.tsx
import { useId, useState } from "react";
import type { SubmittedManualSource } from "./ScannerForm";

type Props = {
  value: SubmittedManualSource | null;
  onChange: (v: SubmittedManualSource | null) => void;
  disabled?: boolean;
};

export default function SourceInput({ value, onChange, disabled }: Props) {
  const [source, setSource] = useState<string>(value?.sourceCode || "");
  const [compiler, setCompiler] = useState<string>(value?.compilerVersion || "");
  const [contractName, setContractName] = useState<string>(value?.contractName || "");

  // Unique ids per component instance (safe if component renders multiple times)
  const uid = useId();
  const sourceId = `source-${uid}`;
  const fileId = `file-${uid}`;
  const compilerId = `compiler-${uid}`;
  const contractId = `contract-${uid}`;

  function push() {
    onChange({
      sourceCode: source,
      compilerVersion: compiler || undefined,
      contractName: contractName || undefined,
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();

    // If file looks like Etherscan multi-file JSON, keep raw JSON; analyzer can handle it.
    try {
      const parsed = JSON.parse(text);
      if (parsed?.language && parsed?.sources) {
        setSource(text);
        onChange({
          sourceCode: text,
          compilerVersion: compiler || undefined,
          contractName: contractName || undefined,
        });
        return;
      }
    } catch {
      // not JSON — treat as Solidity/text
    }

    setSource(text);
    onChange({
      sourceCode: text,
      compilerVersion: compiler || undefined,
      contractName: contractName || undefined,
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <label htmlFor={sourceId} className="mb-1 block text-sm text-slate-600">
        Paste Solidity source (or multi-file JSON)
      </label>
      <textarea
        id={sourceId}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        onBlur={push}
        rows={12}
        className="h-64 w-full rounded border px-3 py-2 font-mono text-sm"
        placeholder={`// Paste contract(s) here\n// Or upload a .sol/.txt or Etherscan-style multi-file JSON`}
        disabled={disabled}
      />

      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
        <div>
          <label htmlFor={fileId} className="mb-1 block text-sm text-slate-600">
            Upload file
          </label>
          <input
            id={fileId}
            type="file"
            accept=".sol,.txt,.json"
            onChange={onFile}
            disabled={disabled}
          />
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor={compilerId} className="mb-1 block text-sm text-slate-600">
              Compiler (optional)
            </label>
            <input
              id={compilerId}
              value={compiler}
              onChange={(e) => setCompiler(e.target.value)}
              onBlur={push}
              placeholder="v0.8.26+commit..."
              className="w-full rounded border px-3 py-2"
              disabled={disabled}
            />
          </div>

          <div>
            <label htmlFor={contractId} className="mb-1 block text-sm text-slate-600">
              Contract name (optional)
            </label>
            <input
              id={contractId}
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              onBlur={push}
              placeholder="MyToken"
              className="w-full rounded border px-3 py-2"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
