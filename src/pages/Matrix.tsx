import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { LAYERS, OPS_LEVELS, PHASES, effectivenessScore, type Layer, type OpsLevel, type PhaseId } from "@/lib/evaluation-types";
import { InitiativeDialog } from "@/components/InitiativeDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const phaseColor: Record<PhaseId, string> = {
  sensor: "border-l-phase-sensor",
  edge: "border-l-phase-edge",
  transport: "border-l-phase-transport",
  landing: "border-l-phase-landing",
  ingest: "border-l-phase-ingest",
  cleanse: "border-l-phase-cleanse",
  broker: "border-l-phase-broker",
  deliver: "border-l-phase-deliver",
};

type RowAxis = "level" | "layer";

export default function Matrix() {
  const initiatives = useEvaluationStore((s) => s.initiatives);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [axis, setAxis] = useState<RowAxis>("layer");

  const rows: { id: string; label: string; description: string }[] =
    axis === "layer"
      ? LAYERS.map((l) => ({ id: l.id, label: l.label, description: l.description }))
      : OPS_LEVELS.map((l) => ({ id: l.id, label: l.label, description: l.description }));

  const cells = useMemo(() => {
    const map = new Map<string, typeof initiatives>();
    for (const i of initiatives) {
      const rowKey = axis === "layer" ? i.layer : i.level;
      const k = `${i.phase}|${rowKey}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(i);
    }
    return map;
  }, [initiatives, axis]);

  const openEdit = (id: string) => { setEditing(id); setOpen(true); };
  const openNew = () => { setEditing(null); setOpen(true); };

  return (
    <AppLayout
      title="Phase × Layer Matrix"
      subtitle="Map every AI initiative onto the full data lifecycle — from sensor to delivery"
      actions={
        <div className="flex items-center gap-2">
          <Tabs value={axis} onValueChange={(v) => setAxis(v as RowAxis)}>
            <TabsList>
              <TabsTrigger value="layer">By Layer</TabsTrigger>
              <TabsTrigger value="level">By Ops Level</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />New</Button>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border glass-card">
        <table className="w-full min-w-[1400px]">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs uppercase tracking-wider text-muted-foreground w-36 sticky left-0 bg-card z-10">
                {axis === "layer" ? "Layer" : "Ops level"}
              </th>
              {PHASES.map((p) => (
                <th key={p.id} className="p-3 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.short}</div>
                  <div className="text-sm font-semibold leading-tight">{p.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border align-top">
                <td className="p-3 bg-secondary/30 sticky left-0 z-10">
                  <div className="font-semibold">{row.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-[160px]">{row.description}</div>
                </td>
                {PHASES.map((p) => {
                  const items = cells.get(`${p.id}|${row.id}`) ?? [];
                  return (
                    <td key={p.id} className="p-3 min-w-[180px] border-l border-border">
                      <div className="space-y-2">
                        {items.length === 0 && (
                          <div className="text-xs text-muted-foreground italic opacity-50">—</div>
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
        Toggle the row axis between <strong>Layer</strong> (Vehicle → Edge → Transport → Cloud → Platform) and <strong>Ops Level</strong> (Strategic / Tactical / Operational). Empty cells often signal under-explored opportunity zones — especially on the upstream (left) side.
      </p>

      <InitiativeDialog open={open} onOpenChange={setOpen} initiativeId={editing} />
    </AppLayout>
  );
}
