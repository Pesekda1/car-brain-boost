import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { OPS_LEVELS, PHASES, type PhaseId, type OpsLevel, effectivenessScore } from "@/lib/evaluation-types";
import { InitiativeDialog } from "@/components/InitiativeDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Matrix() {
  const initiatives = useEvaluationStore((s) => s.initiatives);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const cells = useMemo(() => {
    const map = new Map<string, typeof initiatives>();
    for (const i of initiatives) {
      const k = `${i.phase}|${i.level}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(i);
    }
    return map;
  }, [initiatives]);

  const phaseColor: Record<PhaseId, string> = {
    ingest: "border-l-phase-ingest",
    cleanse: "border-l-phase-cleanse",
    broker: "border-l-phase-broker",
    deliver: "border-l-phase-deliver",
  };

  const openEdit = (id: string) => { setEditing(id); setOpen(true); };
  const openNew = () => { setEditing(null); setOpen(true); };

  return (
    <AppLayout
      title="Phase × Ops-Level Matrix"
      subtitle="Map every AI initiative onto the brokerage lifecycle and operational altitude"
      actions={<Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />New</Button>}
    >
      <div className="overflow-x-auto rounded-xl border border-border glass-card">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-muted-foreground w-32">Ops level</th>
              {PHASES.map((p) => (
                <th key={p.id} className="p-3 text-left">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.short}</div>
                  <div className="text-sm font-semibold">{p.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OPS_LEVELS.map((lvl: { id: OpsLevel; label: string; description: string }) => (
              <tr key={lvl.id} className="border-t border-border align-top">
                <td className="p-3 bg-secondary/30">
                  <div className="font-semibold">{lvl.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{lvl.description}</div>
                </td>
                {PHASES.map((p) => {
                  const items = cells.get(`${p.id}|${lvl.id}`) ?? [];
                  return (
                    <td key={p.id} className="p-3 min-w-[220px] border-l border-border">
                      <div className="space-y-2">
                        {items.length === 0 && (
                          <div className="text-xs text-muted-foreground italic opacity-60">No initiatives</div>
                        )}
                        {items.map((i) => {
                          const score = effectivenessScore(i.scores);
                          return (
                            <button
                              key={i.id}
                              onClick={() => openEdit(i.id)}
                              className={`w-full text-left rounded-lg bg-card border border-border border-l-4 ${phaseColor[i.phase]} p-2.5 hover:border-primary/40 transition-colors`}
                            >
                              <div className="text-sm font-medium leading-tight mb-1.5">{i.name}</div>
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="capitalize">{i.status.replace("-", " ")}</span>
                                <span className="font-mono text-primary">{score}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Click any card to edit. Use this matrix to spot gaps — empty cells often signal under-explored opportunity zones.
      </p>

      <InitiativeDialog open={open} onOpenChange={setOpen} initiativeId={editing} />
    </AppLayout>
  );
}
