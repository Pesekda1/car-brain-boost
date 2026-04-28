export type PhaseId =
  | "sensor"
  | "edge"
  | "transport"
  | "landing"
  | "ingest"
  | "cleanse"
  | "broker"
  | "deliver";

export type Layer = "vehicle" | "edge" | "transport" | "cloud" | "platform";
export type OpsLevel = "strategic" | "tactical" | "operational";
export type Status = "idea" | "evaluating" | "piloting" | "in-production" | "rejected";

export const PHASES: { id: PhaseId; label: string; short: string; description: string; defaultLayer: Layer }[] = [
  { id: "sensor",    label: "Sensor + HAL (Vehicle)",          short: "Sensor",    defaultLayer: "vehicle",   description: "ECU/CAN/LIN/FlexRay/Ethernet capture, AUTOSAR HAL, signal normalization on-vehicle." },
  { id: "edge",      label: "Edge Compute & Buffering",         short: "Edge",      defaultLayer: "edge",      description: "On-vehicle filtering, semantic compression, event detection, store-and-forward." },
  { id: "transport", label: "OTA Transport & Telematics",       short: "Transport", defaultLayer: "transport", description: "MQTT/HTTPS over cellular/V2X, TLS, backpressure, retry, fleet-aware routing." },
  { id: "landing",   label: "AWS Landing (S3/Kinesis/Lambda)",  short: "Landing",   defaultLayer: "cloud",     description: "Raw S3 landing zone, Kinesis streams, Lambda routing & first-touch enrichment." },
  { id: "ingest",    label: "Data Acquisition & Ingestion",     short: "Ingest",    defaultLayer: "platform",  description: "Platform ingestion: OEM telemetry, partner feeds, schema registration." },
  { id: "cleanse",   label: "Cleansing, Enrichment & Quality",  short: "Cleanse",   defaultLayer: "platform",  description: "Normalization, validation, anonymization, enrichment." },
  { id: "broker",    label: "Cataloging & Brokerage",           short: "Broker",    defaultLayer: "platform",  description: "Productize, price, match buyers and sellers." },
  { id: "deliver",   label: "Delivery, Monitoring & Support",   short: "Deliver",   defaultLayer: "platform",  description: "Distribution, SLAs, customer success, compliance." },
];

export const LAYERS: { id: Layer; label: string; description: string }[] = [
  { id: "vehicle",   label: "Vehicle",   description: "On-board sensors, ECUs, HAL, AUTOSAR." },
  { id: "edge",      label: "Edge",      description: "Vehicle-edge compute, gateways, buffering." },
  { id: "transport", label: "Transport", description: "OTA pipes: cellular, V2X, MQTT, HTTPS." },
  { id: "cloud",     label: "Cloud",     description: "AWS landing: S3, Kinesis, Lambda, Glue." },
  { id: "platform",  label: "Platform",  description: "Brokerage product layers above raw cloud." },
];

export const OPS_LEVELS: { id: OpsLevel; label: string; description: string }[] = [
  { id: "strategic",   label: "Strategic",   description: "Portfolio direction, partnerships, long-term bets." },
  { id: "tactical",    label: "Tactical",    description: "Quarterly initiatives, team-level optimization." },
  { id: "operational", label: "Operational", description: "Day-to-day automation and efficiency." },
];

export type ScoreDimension =
  | "businessImpact"
  | "operationalEfficiency"
  | "riskCompliance"
  | "feasibility"
  | "latency"
  | "bandwidth"
  | "safety";

export const DIMENSIONS: { id: ScoreDimension; label: string; description: string; positive: boolean; group: "value" | "technical" }[] = [
  { id: "businessImpact",        label: "Business Impact",          description: "Revenue uplift, cost savings, time-to-market.",                                          positive: true, group: "value" },
  { id: "operationalEfficiency", label: "Operational Efficiency",   description: "Throughput, automation rate, FTE saved.",                                                positive: true, group: "value" },
  { id: "riskCompliance",        label: "Risk & Compliance",        description: "GDPR, data sovereignty, OEM contracts, model risk. Higher = lower risk.",                positive: true, group: "value" },
  { id: "feasibility",           label: "Feasibility & Maturity",   description: "Tech readiness, data readiness, build vs buy.",                                          positive: true, group: "value" },
  { id: "latency",               label: "Latency / Real-time Fit",  description: "How well it meets ms-level vehicle / streaming constraints. Higher = better real-time.", positive: true, group: "technical" },
  { id: "bandwidth",             label: "Bandwidth & Cost Eff.",    description: "Cellular cost, compression ratio, cloud egress impact.",                                 positive: true, group: "technical" },
  { id: "safety",                label: "Functional Safety",        description: "Impact on ASIL / ISO 26262 safety case. Higher = safer / lower safety risk.",            positive: true, group: "technical" },
];

export interface Scores {
  businessImpact: number;
  operationalEfficiency: number;
  riskCompliance: number;
  feasibility: number;
  latency: number;
  bandwidth: number;
  safety: number;
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  phase: PhaseId;
  layer: Layer;
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
  "idea":          { label: "Idea",          tone: "bg-muted text-muted-foreground" },
  "evaluating":    { label: "Evaluating",    tone: "bg-primary/15 text-primary border border-primary/30" },
  "piloting":      { label: "Piloting",      tone: "bg-accent/15 text-accent border border-accent/30" },
  "in-production": { label: "In Production", tone: "bg-success/15 text-success border border-success/30" },
  "rejected":      { label: "Rejected",      tone: "bg-destructive/15 text-destructive border border-destructive/30" },
};

export function effectivenessScore(s: Scores) {
  const vals = DIMENSIONS.map((d) => s[d.id] ?? 0);
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round((sum / (vals.length * 10)) * 100);
}

/** Back-fill missing fields on legacy persisted initiatives. */
export function normalizeInitiative(i: any): Initiative {
  const phase: PhaseId = i.phase ?? "ingest";
  const phaseMeta = PHASES.find((p) => p.id === phase) ?? PHASES[4];
  return {
    id: i.id,
    name: i.name ?? "",
    description: i.description ?? "",
    phase,
    layer: i.layer ?? phaseMeta.defaultLayer,
    level: i.level ?? "tactical",
    status: i.status ?? "idea",
    approach: i.approach ?? "build",
    estCost: i.estCost ?? 0,
    estRoi: i.estRoi ?? 0,
    scores: {
      businessImpact:        i.scores?.businessImpact        ?? 5,
      operationalEfficiency: i.scores?.operationalEfficiency ?? 5,
      riskCompliance:        i.scores?.riskCompliance        ?? 5,
      feasibility:           i.scores?.feasibility           ?? 5,
      latency:               i.scores?.latency               ?? 5,
      bandwidth:             i.scores?.bandwidth             ?? 5,
      safety:                i.scores?.safety                ?? 5,
    },
    notes: i.notes ?? "",
    createdAt: i.createdAt ?? Date.now(),
  };
}
