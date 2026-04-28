import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { DIMENSIONS, effectivenessScore } from "@/lib/evaluation-types";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--phase-cleanse))",
  "hsl(var(--phase-deliver))",
  "hsl(var(--phase-broker))",
];

export default function Compare() {
  const initiatives = useEvaluationStore((s) => s.initiatives);
  const [selected, setSelected] = useState<string[]>(initiatives.slice(0, 3).map((i) => i.id));

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 5 ? prev : [...prev, id]
    );
  };

  const data = useMemo(() => {
    const picked = initiatives.filter((i) => selected.includes(i.id));
    return DIMENSIONS.map((d) => {
      const row: any = { dim: d.label.split(" ")[0] };
      picked.forEach((i) => { row[i.name] = i.scores[d.id] * 10; });
      return row;
    });
  }, [initiatives, selected]);

  const ranked = useMemo(
    () => [...initiatives].sort((a, b) => effectivenessScore(b.scores) - effectivenessScore(a.scores)),
    [initiatives]
  );

  const picked = initiatives.filter((i) => selected.includes(i.id));

  return (
    <AppLayout title="Compare initiatives" subtitle="Pick up to 5 and compare effectiveness profiles side by side">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="glass-card p-4">
          <div className="text-sm font-semibold mb-3">Select initiatives ({selected.length}/5)</div>
          <ScrollArea className="h-[520px] pr-2">
            <div className="space-y-1.5">
              {ranked.map((i) => {
                const checked = selected.includes(i.id);
                const score = effectivenessScore(i.scores);
                return (
                  <label key={i.id} className={`flex items-start gap-2 rounded-lg p-2 cursor-pointer transition-colors ${checked ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50 border border-transparent"}`}>
                    <Checkbox checked={checked} onCheckedChange={() => toggle(i.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight truncate">{i.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{i.phase}</span>
                        <span>·</span>
                        <span className="font-mono text-primary">{score}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        <div className="space-y-4">
          <Card className="glass-card p-5">
            <h3 className="font-semibold mb-3">Effectiveness profile</h3>
            <div className="h-[380px]">
              {picked.length === 0 ? (
                <div className="h-full grid place-items-center text-sm text-muted-foreground">Select initiatives to compare.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dim" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={10} angle={90} domain={[0, 100]} />
                    {picked.map((i, idx) => (
                      <Radar key={i.id} dataKey={i.name} stroke={PALETTE[idx]} fill={PALETTE[idx]} fillOpacity={0.18} strokeWidth={2} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {picked.length > 0 && (
            <Card className="glass-card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Initiative</th>
                      {DIMENSIONS.map((d) => (
                        <th key={d.id} className="text-center p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{d.label.split(" ")[0]}</th>
                      ))}
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Cost</th>
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ROI</th>
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {picked.map((i, idx) => (
                      <tr key={i.id} className="border-b border-border last:border-0">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[idx] }} />
                            <span className="font-medium">{i.name}</span>
                          </div>
                        </td>
                        {DIMENSIONS.map((d) => <td key={d.id} className="text-center p-3 font-mono">{i.scores[d.id]}</td>)}
                        <td className="text-center p-3 font-mono text-muted-foreground">{i.estCost}k€</td>
                        <td className="text-center p-3 font-mono text-success">{i.estRoi}%</td>
                        <td className="text-center p-3 font-mono text-primary font-bold">{effectivenessScore(i.scores)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
