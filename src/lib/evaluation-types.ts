export type PhaseId = "ingest" | "cleanse" | "broker" | "deliver";
export type OpsLevel = "strategic" | "tactical" | "operational";
export type Status = "idea" | "evaluating" | "piloting" | "in-production" | "rejected";

export const PHASES: { id: PhaseId; label: string; short: string; description: string }[] = [
  { id: "ingest", label: "Data Acquisition & Ingestion", short: "Ingest", description: "OEM telemetry, vehicle signals, partner feeds." },
  { id: "cleanse", label: "Cleansing, Enrichment & Quality", short: "Cleanse", description: "Normalization, validation, anonymization, enrichment." },
  { id: "broker", label: "Cataloging & Brokerage", short: "Broker", description: "Productize, price, match buyers and sellers." },
  { id: "deliver", label: "Delivery, Monitoring & Support", short: "Deliver", description: "Distribution, SLAs, customer success, compliance." },
];

export const OPS_LEVELS: { id: OpsLevel; label: string; description: string }[] = [
  { id: "strategic", label: "Strategic", description: "Portfolio direction, partnerships, long-term bets." },
  { id: "tactical", label: "Tactical", description: "Quarterly initiatives, team-level optimization." },
  { id: "operational", label: "Operational", description: "Day-to-day automation and efficiency." },
];

export type ScoreDimension = "businessImpact" | "operationalEfficiency" | "riskCompliance" | "feasibility";

export const DIMENSIONS: { id: ScoreDimension; label: string; description: string; positive: boolean }[] = [
  { id: "businessImpact", label: "Business Impact", description: "Revenue uplift, cost savings, time-to-market.", positive: true },
  { id: "operationalEfficiency", label: "Operational Efficiency", description: "Throughput, automation rate, FTE saved.", positive: true },
  { id: "riskCompliance", label: "Risk & Compliance", description: "GDPR, data sovereignty, OEM contracts, model risk. Higher = lower risk.", positive: true },
  { id: "feasibility", label: "Feasibility & Maturity", description: "Tech readiness, data readiness, build vs buy.", positive: true },
];

export interface Scores {
  businessImpact: number; // 0-10
  operationalEfficiency: number;
  riskCompliance: number;
  feasibility: number;
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  phase: PhaseId;
  level: OpsLevel;
  status: Status;
  approach: "build" | "buy" | "partner" | "hybrid";
  estCost: number; // k€
  estRoi: number;  // %
  scores: Scores;
  notes: string;
  createdAt: number;
}

export const STATUS_META: Record<Status, { label: string; tone: string }> = {
  "idea": { label: "Idea", tone: "bg-muted text-muted-foreground" },
  "evaluating": { label: "Evaluating", tone: "bg-primary/15 text-primary border border-primary/30" },
  "piloting": { label: "Piloting", tone: "bg-accent/15 text-accent border border-accent/30" },
  "in-production": { label: "In Production", tone: "bg-success/15 text-success border border-success/30" },
  "rejected": { label: "Rejected", tone: "bg-destructive/15 text-destructive border border-destructive/30" },
};

export function effectivenessScore(s: Scores) {
  // Equal weighted composite, 0-100
  return Math.round(((s.businessImpact + s.operationalEfficiency + s.riskCompliance + s.feasibility) / 40) * 100);
}
