import { AppLayout } from "@/components/AppLayout";
import { PRESENTATION_LAYERS } from "@/lib/presentation-layers";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { effectivenessScore } from "@/lib/evaluation-types";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Radio, Layers, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICONS = { "in-car": Car, transport: Radio, blending: Layers, business: Briefcase } as const;

export default function PresentHub() {
  const initiatives = useEvaluationStore((s) => s.initiatives);

  return (
    <AppLayout
      title="Discussion Guide — AI in Car Data Brokerage"
      subtitle="Hub for our 4-layer working session. Click a layer to drill into architecture, use-cases, scoring, and scenarios."
    >
      <section className="mb-8 hero-bg rounded-2xl border border-border p-8 lg:p-10">
        <div className="text-[11px] uppercase tracking-[0.25em] text-primary mb-3">Working session</div>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 max-w-3xl">
          Where should AI live in our <span className="text-gradient">car data brokerage</span> stack?
        </h2>
        <p className="text-muted-foreground max-w-2xl mb-6">
          Four layers. Three of them deep-tech (in-car, transport, blending). One business-facing (the deals layer).
          Each layer has an architecture diagram, candidate use-cases with pros/cons, a live scoring panel, and a what-if simulator.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/40 text-primary">Hub + drill-down</Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">Live scoring persists locally</Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">{initiatives.length} initiatives integrated</Badge>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {PRESENTATION_LAYERS.map((layer) => {
          const Icon = ICONS[layer.id];
          const linked = initiatives.filter((i) => layer.phases.includes(i.phase));
          const avgScore = linked.length
            ? Math.round(linked.reduce((a, i) => a + effectivenessScore(i.scores), 0) / linked.length)
            : 0;
          return (
            <Link
              key={layer.id}
              to={`/present/${layer.id}`}
              className="group glass-card rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-[var(--shadow-glow)] flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl border"
                  style={{
                    background: `hsl(var(--${layer.accent}) / 0.15)`,
                    borderColor: `hsl(var(--${layer.accent}) / 0.4)`,
                    color: `hsl(var(--${layer.accent}))`,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Layer</div>
                  <div className="text-2xl font-bold text-gradient">{String(layer.index).padStart(2, "0")}</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-1">{layer.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 flex-1">{layer.tagline}</p>

              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                <div className="rounded-lg bg-secondary/40 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Use-cases</div>
                  <div className="text-lg font-semibold">{layer.useCases.length}</div>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Initiatives</div>
                  <div className="text-lg font-semibold">{linked.length}</div>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg score</div>
                  <div className="text-lg font-semibold text-primary">{avgScore || "—"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={layer.audience === "exec" ? "border-accent/40 text-accent" : "border-primary/40 text-primary"}
                >
                  {layer.audience === "exec" ? "Exec view" : "Deep tech"}
                </Badge>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  Open layer <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppLayout>
  );
}
