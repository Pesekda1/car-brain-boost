import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Initiative } from "./evaluation-types";

interface State {
  initiatives: Initiative[];
  add: (i: Omit<Initiative, "id" | "createdAt">) => string;
  update: (id: string, patch: Partial<Initiative>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

const seed: Initiative[] = [
  {
    id: nanoid(), createdAt: Date.now(),
    name: "Anomaly detection on telemetry ingest",
    description: "ML model flags malformed or suspicious vehicle signal payloads at the edge of ingestion.",
    phase: "ingest", level: "operational", status: "piloting", approach: "build",
    estCost: 120, estRoi: 180,
    scores: { businessImpact: 6, operationalEfficiency: 9, riskCompliance: 8, feasibility: 7 },
    notes: "Reduces downstream cleanup cost; needs labeled samples from 2 OEMs.",
  },
  {
    id: nanoid(), createdAt: Date.now(),
    name: "LLM-assisted schema mapping",
    description: "LLM proposes mappings from new OEM payloads to canonical brokerage schema; human-in-the-loop approval.",
    phase: "cleanse", level: "tactical", status: "evaluating", approach: "hybrid",
    estCost: 220, estRoi: 240,
    scores: { businessImpact: 8, operationalEfficiency: 8, riskCompliance: 6, feasibility: 7 },
    notes: "Cuts onboarding of new OEM from 6 weeks to ~10 days.",
  },
  {
    id: nanoid(), createdAt: Date.now(),
    name: "PII & re-identification risk classifier",
    description: "Classifier scores each dataset for re-identification risk before publishing to the catalog.",
    phase: "cleanse", level: "strategic", status: "in-production", approach: "build",
    estCost: 180, estRoi: 0,
    scores: { businessImpact: 5, operationalEfficiency: 7, riskCompliance: 10, feasibility: 8 },
    notes: "Compliance-critical. Blocks GDPR exposure incidents.",
  },
  {
    id: nanoid(), createdAt: Date.now(),
    name: "Dynamic pricing for data products",
    description: "Reinforcement-learning pricing per buyer cohort, dataset freshness, and contract tier.",
    phase: "broker", level: "strategic", status: "evaluating", approach: "build",
    estCost: 380, estRoi: 320,
    scores: { businessImpact: 9, operationalEfficiency: 6, riskCompliance: 5, feasibility: 5 },
    notes: "High upside, but legal review needed on differential pricing per OEM contracts.",
  },
  {
    id: nanoid(), createdAt: Date.now(),
    name: "Semantic dataset search for buyers",
    description: "Embeddings + RAG over the catalog so buyers can describe a use case and get dataset bundles.",
    phase: "broker", level: "tactical", status: "piloting", approach: "hybrid",
    estCost: 150, estRoi: 210,
    scores: { businessImpact: 8, operationalEfficiency: 7, riskCompliance: 7, feasibility: 8 },
    notes: "Drives self-serve discovery; reduces sales-engineering load.",
  },
  {
    id: nanoid(), createdAt: Date.now(),
    name: "SLA breach prediction",
    description: "Forecasts delivery SLA breaches 24h ahead so ops can pre-empt with rerouting or capacity.",
    phase: "deliver", level: "operational", status: "evaluating", approach: "build",
    estCost: 90, estRoi: 160,
    scores: { businessImpact: 6, operationalEfficiency: 9, riskCompliance: 7, feasibility: 8 },
    notes: "Uses existing telemetry; quick win.",
  },
  {
    id: nanoid(), createdAt: Date.now(),
    name: "AI copilot for buyer support",
    description: "Conversational agent answers buyer questions on dataset schemas, lineage, and contracts.",
    phase: "deliver", level: "tactical", status: "idea", approach: "buy",
    estCost: 80, estRoi: 140,
    scores: { businessImpact: 6, operationalEfficiency: 8, riskCompliance: 6, feasibility: 9 },
    notes: "Vendor available; needs grounding on internal docs.",
  },
];

export const useEvaluationStore = create<State>()(
  persist(
    (set) => ({
      initiatives: seed,
      add: (i) => {
        const id = nanoid();
        set((s) => ({ initiatives: [{ ...i, id, createdAt: Date.now() }, ...s.initiatives] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({ initiatives: s.initiatives.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
      remove: (id) => set((s) => ({ initiatives: s.initiatives.filter((it) => it.id !== id) })),
      reset: () => set({ initiatives: seed }),
    }),
    { name: "ai-eval-workspace-v1" }
  )
);
