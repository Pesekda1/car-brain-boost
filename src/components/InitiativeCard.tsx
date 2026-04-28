import { Badge } from "@/components/ui/badge";
import { PHASES, OPS_LEVELS, STATUS_META, effectivenessScore, type Initiative } from "@/lib/evaluation-types";
import { ArrowUpRight, Coins, TrendingUp } from "lucide-react";

const phaseColor: Record<string, string> = {
  ingest: "bg-phase-ingest/15 text-phase-ingest border-phase-ingest/30",
  cleanse: "bg-phase-cleanse/15 text-phase-cleanse border-phase-cleanse/30",
  broker: "bg-phase-broker/15 text-phase-broker border-phase-broker/30",
  deliver: "bg-phase-deliver/15 text-phase-deliver border-phase-deliver/30",
};

export function InitiativeCard({ initiative, onClick }: { initiative: Initiative; onClick?: () => void }) {
  const phase = PHASES.find((p) => p.id === initiative.phase)!;
  const level = OPS_LEVELS.find((l) => l.id === initiative.level)!;
  const score = effectivenessScore(initiative.scores);
  const status = STATUS_META[initiative.status];

  return (
    <button
      onClick={onClick}
      className="group glass-card text-left rounded-xl p-5 hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--shadow-glow)] w-full"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={phaseColor[initiative.phase]}>{phase.short}</Badge>
          <Badge variant="outline" className="border-border text-muted-foreground capitalize">{level.label}</Badge>
          <Badge variant="outline" className={status.tone}>{status.label}</Badge>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
      <h3 className="font-semibold text-base leading-tight mb-1">{initiative.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{initiative.description}</p>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Effectiveness</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gradient">{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Coins className="h-3 w-3" />{initiative.estCost}k€</span>
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" />{initiative.estRoi}%</span>
        </div>
      </div>
    </button>
  );
}
