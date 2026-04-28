import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Initiative } from "./evaluation-types";
import { normalizeInitiative } from "./evaluation-types";

interface State {
  initiatives: Initiative[];
  add: (i: Omit<Initiative, "id" | "createdAt">) => string;
  update: (id: string, patch: Partial<Initiative>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

const mk = (i: Omit<Initiative, "id" | "createdAt">): Initiative => ({
  ...i,
  id: nanoid(),
  createdAt: Date.now(),
});

const seed: Initiative[] = [
  // ---------- Vehicle: Sensor + HAL ----------
  mk({
    name: "TinyML anomaly detection on ECU",
    description: "On-MCU model flags out-of-distribution CAN/Ethernet signals at the source so corrupt frames never leave the vehicle.",
    phase: "sensor", layer: "vehicle", level: "operational", status: "piloting", approach: "build",
    estCost: 220, estRoi: 140,
    scores: { businessImpact: 5, operationalEfficiency: 8, riskCompliance: 8, feasibility: 6, latency: 10, bandwidth: 9, safety: 8 },
    notes: "Runs in <1ms on AURIX. Cuts garbage telemetry by ~22% in pilot fleet.",
  }),
  mk({
    name: "ML-assisted HAL signal denoising",
    description: "AUTOSAR-compliant denoiser for radar & IMU signals before they hit the vehicle data bus, improving downstream feature quality.",
    phase: "sensor", layer: "vehicle", level: "tactical", status: "evaluating", approach: "hybrid",
    estCost: 310, estRoi: 110,
    scores: { businessImpact: 6, operationalEfficiency: 7, riskCompliance: 6, feasibility: 5, latency: 9, bandwidth: 7, safety: 7 },
    notes: "Needs ASIL-B argumentation; partner with Tier-1 supplier.",
  }),

  // ---------- Edge: compute & buffering ----------
  mk({
    name: "Semantic compression on vehicle gateway",
    description: "Edge model summarizes raw telemetry into events + sketches, dropping cellular payload by 5-10x with controlled fidelity loss.",
    phase: "edge", layer: "edge", level: "tactical", status: "piloting", approach: "build",
    estCost: 280, estRoi: 230,
    scores: { businessImpact: 8, operationalEfficiency: 9, riskCompliance: 7, feasibility: 7, latency: 8, bandwidth: 10, safety: 7 },
    notes: "Biggest single lever on cellular cost. Coordinate with product on lossy contract terms.",
  }),
  mk({
    name: "On-device PII blurring (cameras/GPS)",
    description: "Edge inference blurs faces/plates and fuzzes precise GPS before transmit, so raw PII never leaves the car.",
    phase: "edge", layer: "edge", level: "strategic", status: "evaluating", approach: "build",
    estCost: 340, estRoi: 90,
    scores: { businessImpact: 5, operationalEfficiency: 6, riskCompliance: 10, feasibility: 6, latency: 8, bandwidth: 8, safety: 8 },
    notes: "Compliance-critical for GDPR & UN R155. Blocks several legal escalations.",
  }),
  mk({
    name: "Adaptive event-trigger model",
    description: "Edge classifier decides which trips to upload in full vs sketch, prioritizing valuable / anomalous drives.",
    phase: "edge", layer: "edge", level: "operational", status: "idea", approach: "build",
    estCost: 140, estRoi: 180,
    scores: { businessImpact: 7, operationalEfficiency: 8, riskCompliance: 6, feasibility: 8, latency: 7, bandwidth: 9, safety: 6 },
    notes: "Pairs naturally with semantic compression initiative.",
  }),

  // ---------- Transport: OTA & telematics ----------
  mk({
    name: "Predictive adaptive bitrate over cellular",
    description: "RL agent picks bitrate / batching policy per vehicle based on predicted connectivity quality and tariff.",
    phase: "transport", layer: "transport", level: "tactical", status: "evaluating", approach: "build",
    estCost: 180, estRoi: 200,
    scores: { businessImpact: 6, operationalEfficiency: 8, riskCompliance: 7, feasibility: 7, latency: 8, bandwidth: 10, safety: 7 },
    notes: "Estimated 18% cellular cost reduction in simulation.",
  }),
  mk({
    name: "Fleet-aware MQTT routing",
    description: "Server-side controller predicts broker load and reroutes vehicle MQTT sessions to absorb spikes.",
    phase: "transport", layer: "transport", level: "operational", status: "piloting", approach: "build",
    estCost: 95, estRoi: 150,
    scores: { businessImpact: 5, operationalEfficiency: 9, riskCompliance: 7, feasibility: 8, latency: 9, bandwidth: 8, safety: 6 },
    notes: "Quick win; reuses existing telemetry from the load balancer.",
  }),

  // ---------- Cloud: AWS landing ----------
  mk({
    name: "Schema inference on S3 raw landing",
    description: "Lambda + LLM proposes a schema each time a new OEM dumps payloads in the raw S3 bucket; humans approve.",
    phase: "landing", layer: "cloud", level: "tactical", status: "evaluating", approach: "hybrid",
    estCost: 160, estRoi: 220,
    scores: { businessImpact: 7, operationalEfficiency: 9, riskCompliance: 6, feasibility: 8, latency: 6, bandwidth: 6, safety: 5 },
    notes: "Cuts new-OEM onboarding from 6 weeks to ~10 days.",
  }),
  mk({
    name: "Kinesis stream content classifier",
    description: "Streaming model tags each Kinesis record (event type, sensitivity, OEM) so Lambda routers can dispatch correctly.",
    phase: "landing", layer: "cloud", level: "operational", status: "in-production", approach: "build",
    estCost: 120, estRoi: 170,
    scores: { businessImpact: 6, operationalEfficiency: 9, riskCompliance: 8, feasibility: 8, latency: 9, bandwidth: 7, safety: 6 },
    notes: "Already live in eu-central-1. Acts as the single routing brain.",
  }),
  mk({
    name: "Lambda-based first-touch enrichment",
    description: "Stateless Lambdas attach geo, weather, vehicle profile to each landing record before it reaches the platform.",
    phase: "landing", layer: "cloud", level: "operational", status: "piloting", approach: "build",
    estCost: 110, estRoi: 160,
    scores: { businessImpact: 6, operationalEfficiency: 8, riskCompliance: 7, feasibility: 9, latency: 8, bandwidth: 6, safety: 6 },
    notes: "Watch cold-start cost; consider provisioned concurrency.",
  }),

  // ---------- Platform: existing 4 phases ----------
  mk({
    name: "Anomaly detection on telemetry ingest",
    description: "ML model flags malformed or suspicious vehicle signal payloads at the edge of platform ingestion.",
    phase: "ingest", layer: "platform", level: "operational", status: "piloting", approach: "build",
    estCost: 120, estRoi: 180,
    scores: { businessImpact: 6, operationalEfficiency: 9, riskCompliance: 8, feasibility: 7, latency: 8, bandwidth: 6, safety: 6 },
    notes: "Reduces downstream cleanup cost; needs labeled samples from 2 OEMs.",
  }),
  mk({
    name: "LLM-assisted schema mapping",
    description: "LLM proposes mappings from new OEM payloads to canonical brokerage schema; human-in-the-loop approval.",
    phase: "cleanse", layer: "platform", level: "tactical", status: "evaluating", approach: "hybrid",
    estCost: 220, estRoi: 240,
    scores: { businessImpact: 8, operationalEfficiency: 8, riskCompliance: 6, feasibility: 7, latency: 5, bandwidth: 6, safety: 5 },
    notes: "Cuts onboarding of new OEM from 6 weeks to ~10 days.",
  }),
  mk({
    name: "PII & re-identification risk classifier",
    description: "Classifier scores each dataset for re-identification risk before publishing to the catalog.",
    phase: "cleanse", layer: "platform", level: "strategic", status: "in-production", approach: "build",
    estCost: 180, estRoi: 0,
    scores: { businessImpact: 5, operationalEfficiency: 7, riskCompliance: 10, feasibility: 8, latency: 6, bandwidth: 6, safety: 8 },
    notes: "Compliance-critical. Blocks GDPR exposure incidents.",
  }),
  mk({
    name: "Dynamic pricing for data products",
    description: "Reinforcement-learning pricing per buyer cohort, dataset freshness, and contract tier.",
    phase: "broker", layer: "platform", level: "strategic", status: "evaluating", approach: "build",
    estCost: 380, estRoi: 320,
    scores: { businessImpact: 9, operationalEfficiency: 6, riskCompliance: 5, feasibility: 5, latency: 6, bandwidth: 6, safety: 5 },
    notes: "High upside, but legal review needed on differential pricing per OEM contracts.",
  }),
  mk({
    name: "Semantic dataset search for buyers",
    description: "Embeddings + RAG over the catalog so buyers can describe a use case and get dataset bundles.",
    phase: "broker", layer: "platform", level: "tactical", status: "piloting", approach: "hybrid",
    estCost: 150, estRoi: 210,
    scores: { businessImpact: 8, operationalEfficiency: 7, riskCompliance: 7, feasibility: 8, latency: 7, bandwidth: 6, safety: 5 },
    notes: "Drives self-serve discovery; reduces sales-engineering load.",
  }),
  mk({
    name: "SLA breach prediction",
    description: "Forecasts delivery SLA breaches 24h ahead so ops can pre-empt with rerouting or capacity.",
    phase: "deliver", layer: "platform", level: "operational", status: "evaluating", approach: "build",
    estCost: 90, estRoi: 160,
    scores: { businessImpact: 6, operationalEfficiency: 9, riskCompliance: 7, feasibility: 8, latency: 7, bandwidth: 6, safety: 5 },
    notes: "Uses existing telemetry; quick win.",
  }),
  mk({
    name: "AI copilot for buyer support",
    description: "Conversational agent answers buyer questions on dataset schemas, lineage, and contracts.",
    phase: "deliver", layer: "platform", level: "tactical", status: "idea", approach: "buy",
    estCost: 80, estRoi: 140,
    scores: { businessImpact: 6, operationalEfficiency: 8, riskCompliance: 6, feasibility: 9, latency: 6, bandwidth: 6, safety: 5 },
    notes: "Vendor available; needs grounding on internal docs.",
  }),
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
    {
      name: "ai-eval-workspace-v2",
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted?.initiatives) return { initiatives: seed };
        return { initiatives: persisted.initiatives.map(normalizeInitiative) };
      },
    }
  )
);
