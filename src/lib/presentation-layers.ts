import type { PhaseId } from "./evaluation-types";

export type PresentationLayerId = "in-car" | "transport" | "blending" | "business";
export type Audience = "deep-tech" | "exec";

export interface PresentationLayer {
  id: PresentationLayerId;
  index: number;
  title: string;
  tagline: string;
  audience: Audience;
  /** Initiatives from these phases roll up into this layer. */
  phases: PhaseId[];
  /** Architecture diagram nodes, left-to-right. */
  architecture: { id: string; label: string; sub: string }[];
  /** Use-case cards with pros/cons for the discussion. */
  useCases: {
    title: string;
    summary: string;
    pros: string[];
    cons: string[];
    horizon: "now" | "12-24m" | "future";
  }[];
  /** Scenario simulator definition. */
  scenario: {
    title: string;
    description: string;
    inputs: { id: string; label: string; min: number; max: number; step: number; default: number; unit: string }[];
    /** Returns metrics derived from inputs. */
    compute: (v: Record<string, number>) => { label: string; value: string; tone?: "good" | "warn" | "bad" }[];
  };
  accent: string; // tailwind color token suffix on --layer-* / --phase-*
}

export const PRESENTATION_LAYERS: PresentationLayer[] = [
  {
    id: "in-car",
    index: 1,
    title: "AI in the Car",
    tagline: "On-vehicle intelligence — sensor, HAL, edge gateway. The future of where data is born.",
    audience: "deep-tech",
    phases: ["sensor", "edge"],
    accent: "phase-sensor",
    architecture: [
      { id: "sensor", label: "Sensors", sub: "CAN / LIN / FlexRay / Ethernet, cameras, radar, IMU" },
      { id: "hal", label: "HAL / AUTOSAR", sub: "Signal abstraction, ASIL partitioning" },
      { id: "ecu", label: "ECU / MCU", sub: "AURIX, Renesas — TinyML inference <1ms" },
      { id: "gw", label: "Vehicle Gateway", sub: "Linux/QNX, edge ML, store-and-forward" },
      { id: "modem", label: "Modem", sub: "4G/5G/V2X handoff" },
    ],
    useCases: [
      {
        title: "TinyML anomaly detection on ECU",
        summary: "Drop corrupt CAN frames at the source before they pollute downstream pipelines.",
        pros: ["~22% less garbage telemetry", "Sub-ms inference on AURIX", "Reduces cloud cleanup cost"],
        cons: ["Model updates need OTA campaign", "Footprint constrained (<200KB)", "ASIL argumentation overhead"],
        horizon: "now",
      },
      {
        title: "ML-assisted HAL signal denoising",
        summary: "Clean radar/IMU signals at the AUTOSAR HAL before they reach the bus.",
        pros: ["Better downstream feature quality", "Tier-1 supplier partnership viable"],
        cons: ["ASIL-B safety case required", "Long homologation cycle", "Vendor lock-in risk"],
        horizon: "12-24m",
      },
      {
        title: "Semantic compression on gateway",
        summary: "Edge model summarizes raw telemetry into events + sketches; 5-10x payload reduction.",
        pros: ["Largest single lever on cellular cost", "Configurable fidelity", "Pairs with adaptive trigger"],
        cons: ["Lossy contracts need legal sign-off", "Harder forensic replay"],
        horizon: "now",
      },
      {
        title: "On-device PII blurring",
        summary: "Blur faces/plates and fuzz GPS before transmit. Raw PII never leaves the vehicle.",
        pros: ["GDPR / UN R155 ready", "Unblocks several legal escalations"],
        cons: ["GPU-class compute on gateway", "False negatives = compliance incident"],
        horizon: "12-24m",
      },
      {
        title: "Driver-assist co-learning (future)",
        summary: "Federated learning across fleets for ADAS edge cases without uploading raw video.",
        pros: ["Privacy by design", "Network effects across OEMs", "Defensible IP"],
        cons: ["Federated infra immature for safety-critical", "5+ year horizon"],
        horizon: "future",
      },
    ],
    scenario: {
      title: "Edge compression vs cellular cost",
      description: "Estimate the impact of on-vehicle semantic compression on monthly cellular spend.",
      inputs: [
        { id: "fleet", label: "Fleet size", min: 1000, max: 1000000, step: 1000, default: 100000, unit: "vehicles" },
        { id: "raw", label: "Raw daily payload / vehicle", min: 1, max: 200, step: 1, default: 40, unit: "MB" },
        { id: "ratio", label: "Compression ratio", min: 1, max: 12, step: 0.5, default: 6, unit: "x" },
        { id: "price", label: "Cellular price", min: 0.1, max: 5, step: 0.1, default: 0.8, unit: "€/GB" },
      ],
      compute: ({ fleet, raw, ratio, price }) => {
        const baselineGB = (fleet * raw * 30) / 1024;
        const optimizedGB = baselineGB / ratio;
        const baselineCost = baselineGB * price;
        const optimizedCost = optimizedGB * price;
        const saved = baselineCost - optimizedCost;
        return [
          { label: "Baseline cellular / month", value: `€${Math.round(baselineCost).toLocaleString()}` },
          { label: "With edge compression", value: `€${Math.round(optimizedCost).toLocaleString()}`, tone: "good" },
          { label: "Monthly savings", value: `€${Math.round(saved).toLocaleString()}`, tone: "good" },
          { label: "Annual savings", value: `€${Math.round(saved * 12).toLocaleString()}`, tone: "good" },
        ];
      },
    },
  },
  {
    id: "transport",
    index: 2,
    title: "AI in Data Transport",
    tagline: "OTA pipes, telematics, and cloud landing — keeping bytes cheap, fast, and routable.",
    audience: "deep-tech",
    phases: ["transport", "landing"],
    accent: "phase-transport",
    architecture: [
      { id: "modem", label: "Modem", sub: "4G/5G, V2X, satellite fallback" },
      { id: "mqtt", label: "MQTT / HTTPS", sub: "TLS, QoS, backpressure, retry" },
      { id: "edge-pop", label: "Edge PoP", sub: "Region-local broker, fleet-aware routing" },
      { id: "kinesis", label: "Kinesis", sub: "Streams, shards, content classifier" },
      { id: "s3", label: "S3 Landing", sub: "Raw / curated buckets, schema inference" },
      { id: "lambda", label: "Lambda", sub: "First-touch enrichment & dispatch" },
    ],
    useCases: [
      {
        title: "Predictive adaptive bitrate",
        summary: "RL agent picks bitrate / batching per vehicle based on predicted connectivity & tariff.",
        pros: ["~18% cellular cost reduction (sim)", "Per-vehicle policy"],
        cons: ["Cold-start per market", "RL drift monitoring needed"],
        horizon: "now",
      },
      {
        title: "Fleet-aware MQTT routing",
        summary: "Server-side controller predicts broker load and reroutes sessions to absorb spikes.",
        pros: ["Quick win, reuses LB telemetry", "Cuts P99 ingestion latency"],
        cons: ["Requires multi-region broker fabric"],
        horizon: "now",
      },
      {
        title: "Schema inference on S3 landing",
        summary: "Lambda + LLM proposes a schema each time a new OEM dumps payloads. Humans approve.",
        pros: ["New-OEM onboarding 6w → 10d", "Reduces data-engineering toil"],
        cons: ["LLM cost per object", "Hallucination risk on rare schemas"],
        horizon: "now",
      },
      {
        title: "Kinesis stream content classifier",
        summary: "Tags each record (event, sensitivity, OEM) so Lambdas dispatch correctly.",
        pros: ["Single routing brain", "Already production-proven"],
        cons: ["Model retraining cadence", "Sensitivity to schema drift"],
        horizon: "now",
      },
      {
        title: "Lambda first-touch enrichment",
        summary: "Attach geo, weather, vehicle profile before records reach the platform.",
        pros: ["Stateless, scales linearly", "Cheap relative to value"],
        cons: ["Cold-start cost without provisioned concurrency"],
        horizon: "now",
      },
    ],
    scenario: {
      title: "Adaptive transport vs flat policy",
      description: "Estimate latency & cost impact of adaptive routing on fleet ingestion.",
      inputs: [
        { id: "fleet", label: "Active fleet", min: 1000, max: 1000000, step: 1000, default: 250000, unit: "vehicles" },
        { id: "events", label: "Events / vehicle / day", min: 10, max: 5000, step: 10, default: 800, unit: "events" },
        { id: "p99", label: "Current P99 latency", min: 50, max: 5000, step: 50, default: 1200, unit: "ms" },
        { id: "improvement", label: "Adaptive routing gain", min: 5, max: 60, step: 1, default: 28, unit: "%" },
      ],
      compute: ({ fleet, events, p99, improvement }) => {
        const dailyEvents = fleet * events;
        const newP99 = p99 * (1 - improvement / 100);
        const kinesisShards = Math.ceil(dailyEvents / 86400 / 1000);
        return [
          { label: "Daily events ingested", value: `${(dailyEvents / 1e6).toFixed(1)}M` },
          { label: "Kinesis shards (1k rec/s)", value: `${kinesisShards}` },
          { label: "New P99 latency", value: `${Math.round(newP99)} ms`, tone: "good" },
          { label: "P99 reduction", value: `-${Math.round(p99 - newP99)} ms`, tone: "good" },
        ];
      },
    },
  },
  {
    id: "blending",
    index: 3,
    title: "AI in Data Blending & Interpretation",
    tagline: "Cleansing, enrichment, semantic catalog — turning raw signals into sellable products.",
    audience: "deep-tech",
    phases: ["ingest", "cleanse"],
    accent: "phase-cleanse",
    architecture: [
      { id: "ingest", label: "Ingestion", sub: "OEM feeds, partner data, schema registry" },
      { id: "validate", label: "Validation", sub: "Anomaly detection, drift checks" },
      { id: "normalize", label: "Normalization", sub: "Canonical schema, units, time bases" },
      { id: "enrich", label: "Enrichment", sub: "Geo, weather, vehicle profile, OEM context" },
      { id: "anonymize", label: "Anonymization", sub: "PII scoring, k-anonymity, differential privacy" },
      { id: "catalog", label: "Semantic Catalog", sub: "Embeddings, lineage, quality grade" },
    ],
    useCases: [
      {
        title: "Anomaly detection on ingest",
        summary: "ML flags malformed or suspicious payloads at the platform edge.",
        pros: ["Cuts downstream cleanup cost", "Reuses telemetry from 2 OEMs"],
        cons: ["Needs continuous labeled samples"],
        horizon: "now",
      },
      {
        title: "LLM-assisted schema mapping",
        summary: "LLM proposes mappings from new OEM payloads to canonical schema; HITL approval.",
        pros: ["Onboarding 6w → 10d", "Scales across OEMs"],
        cons: ["Hallucination on rare fields", "Audit log required for contracts"],
        horizon: "now",
      },
      {
        title: "PII & re-id risk classifier",
        summary: "Scores datasets for re-identification risk before publication.",
        pros: ["Blocks GDPR exposure", "Production-grade today"],
        cons: ["False positives slow publishing", "Needs OEM-specific tuning"],
        horizon: "now",
      },
      {
        title: "Cross-OEM data fusion",
        summary: "Probabilistic record linkage across OEM datasets to create higher-value blended products.",
        pros: ["Higher unit economics", "Defensible product moat"],
        cons: ["Contractual minefield", "Differential privacy required"],
        horizon: "12-24m",
      },
      {
        title: "Quality grade autoscoring",
        summary: "Continuous quality grade per dataset (freshness, coverage, completeness) drives pricing.",
        pros: ["Transparent value to buyers", "Feeds dynamic pricing"],
        cons: ["Definition disputes per OEM"],
        horizon: "now",
      },
    ],
    scenario: {
      title: "Onboarding throughput simulator",
      description: "Estimate the OEM-onboarding capacity unlock from LLM-assisted mapping.",
      inputs: [
        { id: "engineers", label: "Data engineers", min: 1, max: 50, step: 1, default: 6, unit: "FTE" },
        { id: "manualWeeks", label: "Manual onboarding effort", min: 1, max: 20, step: 1, default: 6, unit: "weeks" },
        { id: "aiWeeks", label: "AI-assisted effort", min: 0.5, max: 10, step: 0.5, default: 1.5, unit: "weeks" },
        { id: "pipeline", label: "OEMs in pipeline", min: 1, max: 100, step: 1, default: 18, unit: "OEMs" },
      ],
      compute: ({ engineers, manualWeeks, aiWeeks, pipeline }) => {
        const manualCapacity = (engineers * 48) / manualWeeks;
        const aiCapacity = (engineers * 48) / aiWeeks;
        const monthsToClear = pipeline / (aiCapacity / 12);
        return [
          { label: "Manual capacity / year", value: `${manualCapacity.toFixed(1)} OEMs` },
          { label: "AI-assisted capacity / year", value: `${aiCapacity.toFixed(1)} OEMs`, tone: "good" },
          { label: "Throughput multiplier", value: `${(aiCapacity / manualCapacity).toFixed(1)}x`, tone: "good" },
          { label: "Months to clear pipeline", value: `${monthsToClear.toFixed(1)} mo`, tone: "good" },
        ];
      },
    },
  },
  {
    id: "business",
    index: 4,
    title: "AI for the Business of Data",
    tagline: "Cataloging, pricing, deal-making, support — AI that grows revenue and reduces cost-to-serve.",
    audience: "exec",
    phases: ["broker", "deliver"],
    accent: "phase-broker",
    architecture: [
      { id: "catalog", label: "Catalog", sub: "Dataset listings, lineage, contracts" },
      { id: "search", label: "Discovery", sub: "Semantic search, RAG, recommendations" },
      { id: "pricing", label: "Pricing", sub: "Dynamic per buyer / freshness / tier" },
      { id: "deal", label: "Deal-making", sub: "Contract drafting, compliance checks" },
      { id: "delivery", label: "Delivery & SLA", sub: "Routing, monitoring, breach prediction" },
      { id: "support", label: "Support", sub: "AI copilot, lineage Q&A, escalation triage" },
    ],
    useCases: [
      {
        title: "Dynamic pricing for data products",
        summary: "RL pricing per buyer cohort, dataset freshness, contract tier.",
        pros: ["+20-30% revenue upside", "Captures buyer willingness-to-pay"],
        cons: ["Legal review on differential pricing", "Requires solid measurement"],
        horizon: "12-24m",
      },
      {
        title: "Semantic dataset search",
        summary: "Buyers describe a use case in natural language; get curated dataset bundles.",
        pros: ["Self-serve drives shorter sales cycle", "Reduces sales-engineering load"],
        cons: ["Cold-start on niche queries", "Needs strong taxonomy"],
        horizon: "now",
      },
      {
        title: "AI copilot for buyer support",
        summary: "Conversational agent answers schema, lineage, and contract questions.",
        pros: ["Cuts L1 support load 50%+", "Vendor solutions available"],
        cons: ["Needs grounding on internal docs", "Hallucination liability"],
        horizon: "now",
      },
      {
        title: "SLA breach prediction",
        summary: "Forecast delivery breaches 24h ahead so ops can pre-empt.",
        pros: ["Quick win, reuses telemetry", "Protects high-tier accounts"],
        cons: ["Needs change management in ops"],
        horizon: "now",
      },
      {
        title: "Contract & compliance copilot",
        summary: "Drafts data-sharing terms, flags clauses against OEM master agreements.",
        pros: ["Faster deal cycles", "Reduces legal bottleneck"],
        cons: ["Final review must remain with legal", "Audit trail required"],
        horizon: "12-24m",
      },
    ],
    scenario: {
      title: "Revenue & cost-to-serve impact",
      description: "Project the combined business impact of pricing, search, and copilot AI.",
      inputs: [
        { id: "revenue", label: "Annual data revenue", min: 1, max: 500, step: 1, default: 45, unit: "M€" },
        { id: "uplift", label: "Pricing + discovery uplift", min: 0, max: 40, step: 1, default: 18, unit: "%" },
        { id: "supportFte", label: "Support FTEs", min: 1, max: 200, step: 1, default: 24, unit: "FTE" },
        { id: "deflect", label: "Copilot deflection", min: 0, max: 80, step: 1, default: 45, unit: "%" },
      ],
      compute: ({ revenue, uplift, supportFte, deflect }) => {
        const revenueGain = revenue * (uplift / 100);
        const fteCost = 95; // k€ fully loaded
        const supportSaved = (supportFte * deflect / 100 * fteCost) / 1000;
        return [
          { label: "Incremental revenue", value: `+€${revenueGain.toFixed(1)}M / yr`, tone: "good" },
          { label: "Support cost saved", value: `€${supportSaved.toFixed(1)}M / yr`, tone: "good" },
          { label: "Combined annual impact", value: `€${(revenueGain + supportSaved).toFixed(1)}M`, tone: "good" },
          { label: "Effective margin lift", value: `${((revenueGain + supportSaved) / revenue * 100).toFixed(1)}%`, tone: "good" },
        ];
      },
    },
  },
];

export const getLayer = (id: string) => PRESENTATION_LAYERS.find((l) => l.id === id);
