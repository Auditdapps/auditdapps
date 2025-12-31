// src/store/resultsStore.ts
import { create } from "zustand";

export type PreviewFinding = {
  severity: string;
  title: string;
  description: string;
};

export type PreviewResults = {
  score: number;
  summary_md: string;
  findings: PreviewFinding[];
  baseline_findings?: any[];
  counts?: any;
  analytics?: any;
  meta?: any;
  user_type?: string; // "Developer" | "Organization"
} | null;

interface ResultsState {
  results: PreviewResults;
  setResults: (r: PreviewResults) => void;
  clear: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  results: null,
  setResults: (r) => set({ results: r }),
  clear: () => set({ results: null }),
}));
