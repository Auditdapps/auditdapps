// src/lib/explorers.ts
// Unified Etherscan V2 + optional Sourcify fallback

export type ChainKey = "ethereum" | "polygon" | "bsc" | "arbitrum" | "optimism";

type SourceMeta = {
  verified: boolean;
  sourceCode: string | null;                // string (single or multi-file JSON)
  compilerVersion?: string | null;
  contracts?: Array<{ name: string; path?: string }> | null;
  explorer?: string | null;                 // "Etherscan family (V2)"
};

const ETHERSCAN_V2_BASE = "https://api.etherscan.io/v2/api";

const CHAIN_INFO: Record<
  ChainKey,
  { label: string; chainId: string }
> = {
  ethereum: { label: "Ethereum",               chainId: "1"     },
  polygon:  { label: "Polygon",                chainId: "137"   },
  bsc:      { label: "BNB Smart Chain",        chainId: "56"    },
  arbitrum: { label: "Arbitrum One",           chainId: "42161" },
  optimism: { label: "OP Mainnet (Optimism)",  chainId: "10"    },
};

// You now need ONLY one API key for all chains in V2.
function ensureApiKey() {
  const key = import.meta.env.VITE_ETHERSCAN_API_KEY;
  if (!key) {
    throw new Error(
      "Missing VITE_ETHERSCAN_API_KEY in your .env. Create one in your Etherscan account (works for all chains under V2) and restart the dev server."
    );
  }
  return key;
}

async function trySourcify(chainId: string, address: string) {
  // Quick Sourcify probe (full_match first, then partial_match)
  const base = "https://sourcify.dev/server/repository/contracts";
  const addrLower = address.toLowerCase();

  for (const kind of ["full_match", "partial_match"] as const) {
    const metaUrl = `${base}/${kind}/${chainId}/${addrLower}/metadata.json`;
    const res = await fetch(metaUrl);
    if (res.ok) {
      const metadata = await res.json().catch(() => null);
      if (!metadata || !metadata.sources) continue;

      // Compose multi-file JSON compatible with many analyzers:
      // { language, sources: { [path]: { content } } }
      const sources: Record<string, any> = {};
      const entries = Object.keys(metadata.sources);
      // Try to pull each source from /sources/<path>
      // (Sourcify serves raw source files under /sources/)
      await Promise.all(
        entries.map(async (p) => {
          const srcUrl = `${base}/${kind}/${chainId}/${addrLower}/sources/${p}`;
          const sRes = await fetch(srcUrl);
          if (sRes.ok) {
            const content = await sRes.text();
            sources[p] = { content };
          }
        })
      );

      if (Object.keys(sources).length > 0) {
        const sourceJson = JSON.stringify({
          language: metadata.language || "Solidity",
          sources,
          settings: metadata.settings ?? undefined,
        });

        const contracts =
          entries.map((p) => ({ name: p.split("/").pop() || p, path: p })) ?? [];

        return {
          verified: true,
          sourceCode: sourceJson,
          compilerVersion: metadata.compiler?.version ?? null,
          contracts,
          explorer: "Sourcify",
        } as SourceMeta;
      }
    }
  }

  return null;
}

async function fetchEtherscanV2(chain: ChainKey, address: string) {
  const apiKey = ensureApiKey();
  const { chainId } = CHAIN_INFO[chain];

  const qs = new URLSearchParams({
    chainid: chainId,             // ✅ REQUIRED in V2
    module: "contract",
    action: "getsourcecode",
    address,
    apikey: apiKey,
  });

  const url = `${ETHERSCAN_V2_BASE}?${qs.toString()}`;
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  console.debug("[explorers] Etherscan V2 response:", json);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // V2 still generally returns Etherscan-style shape
  // { status: "1"|"0", message: "OK"|"NOTOK", result: [...] | string }
  const ok =
    json?.status === "1" ||
    json?.message === "OK" ||
    (Array.isArray(json?.result) && json.result.length > 0);

  if (!ok) {
    const msg =
      json?.result || json?.message || "Unknown Etherscan V2 error response";
    throw new Error(msg);
  }

  const item = Array.isArray(json?.result) ? json.result[0] : null;
  if (!item) {
    throw new Error("Etherscan V2 returned no results for this address.");
  }

  // Etherscan fields
  let sourceCode: string | null = item?.SourceCode ?? null;
  const compilerVersion: string | null = item?.CompilerVersion ?? null;

  // Multi-file can be JSON string sometimes wrapped as "{{...}}"
  let contracts: Array<{ name: string; path?: string }> | null = null;
  if (sourceCode && sourceCode.startsWith("{")) {
    const trimmed =
      sourceCode.startsWith("{{") && sourceCode.endsWith("}}")
        ? sourceCode.slice(1, -1)
        : sourceCode;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed?.sources && typeof parsed.sources === "object") {
        contracts = Object.keys(parsed.sources).map((p) => ({
          name: p.split("/").pop() || p,
          path: p,
        }));
      }
      sourceCode = trimmed;
    } catch {
      // keep as raw string
    }
  }

  const verified = !!sourceCode && String(sourceCode).length > 0;

  return {
    verified,
    sourceCode,
    compilerVersion,
    contracts: contracts || [],
    explorer: "Etherscan family (V2)",
  } as SourceMeta;
}

export async function getExplorerSource(
  chain: ChainKey,
  address: string
): Promise<SourceMeta> {
  const addr = address.trim();

  // 1) Sourcify first (free + fast if verified there)
  const sourcify = await trySourcify(CHAIN_INFO[chain].chainId, addr);
  if (sourcify) return sourcify;

  // 2) Etherscan V2 (single base, must include chainid)
  const es = await fetchEtherscanV2(chain, addr);

  if (!es.verified) {
    throw new Error(
      `Could not fetch verified source. This contract may not be verified on ${CHAIN_INFO[chain].label}.`
    );
  }
  return es;
}
