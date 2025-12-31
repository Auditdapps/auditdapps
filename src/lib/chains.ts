// src/lib/chains.ts
import type { ChainKey } from "./explorers";

export const chains: Record<
  ChainKey,
  { label: string; chainId: number; explorer: string }
> = {
  ethereum: { label: "Ethereum",              chainId: 1,     explorer: "Etherscan" },
  polygon:  { label: "Polygon",               chainId: 137,   explorer: "Etherscan (Polygon)" },
  bsc:      { label: "BNB Smart Chain",       chainId: 56,    explorer: "Etherscan (BscScan)" },
  arbitrum: { label: "Arbitrum One",          chainId: 42161, explorer: "Etherscan (Arbiscan)" },
  optimism: { label: "OP Mainnet (Optimism)", chainId: 10,    explorer: "Etherscan (OP)" },
};
