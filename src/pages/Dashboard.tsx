import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { DIMENSIONS, PHASES, effectivenessScore } from "@/lib/evaluation-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Activity, Layers, ShieldCheck } from "lucide-react";
import { InitiativeCard } from "@/components/InitiativeCard";
import { InitiativeDialog } from "@/components/InitiativeDialog";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const phaseFill = ["hsl(var(--phase-ingest))", "hsl(var(--phase-cleanse))", "hsl(var(--phase-broker))", "hsl(var(--phase-deliver))"];

export default function Dashboard() {
  const initiatives = useEvaluationStore((s) => s.initiatives);
  const [dlg, setDlg] = useState(false);

  const stats = useMemo(() => {
    const total = initiatives.length;
    const live = initiatives.filter((i) => i.status === "in-production" || i.status === "piloting").length;
    const avg = total ? Math.round(initiatives.reduce((a, i) => a + effectivenessScore(i.scores), 0) / total) : 0;
    const totalCost = initiatives.reduce((a, i) => a + i.estCost, 0);
    return { total, live, avg, totalCost };
  }, [initiatives]);

  const byPhase = useMemo(
    () => PHASES.map((p) => ({
      phase: p.short,
      avg: Math.round(
        (initiatives.filter((i) => i.phase === p.id).reduce((a, i) => a + effectivenessScore(i.scores), 0) /
          Math.max(1, initiatives.filter((i) => i.phase === p.id).length)) || 0
      ),
      count: initiatives.filter((i) => i.phase === p.id).length,
    })),
    [initiatives]
  );

  const radarData = useMemo(
    () => DIMENSIONS.map((d) => ({
      dim: d.label.split(" ")[0],
      value: initiatives.length
        ? Math.round((initiatives.reduce((a, i) => a + i.scores[d.id], 0) / initiatives.length) * 10)
        : 0,
    })),
    [initiatives]
  );

  const top = useMemo(
    () => [...initiatives].sort((a, b) => effectivenessScore(b.scores) - effectivenessScore(a.scores)).slice(0, 3),
    [initiatives]
  );

  return (
    <AppLayout
      title="AI Effectiveness Dashboard"
      subtitle="Portfolio view across phases, ops levels and evaluation dimensions"
      actions={<Button size="sm" onClick={() => setDlg(true)}><Plus className="h-4 w-4 mr-1.5" />New initiative</Button>}
    >
      <section className="hero-bg rounded-2xl border border-border p-6 md:p-8 mb-6 grid-bg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-3">
            <Sparkles className="h-3 w-3" /> Internal · Car Data Brokerage
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Evaluate <span className="text-gradient">AI bets</span> across the brokerage lifecycle.
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Score initiatives on business impact, efficiency, risk and feasibility — then see where they land in the phase × ops-level matrix.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KpiCard icon={<Layers className="h-4 w-4" />} label="Initiatives" value={stats.total} hint="Tracked across phases" />
        <KpiCard icon={<Activity className="h-4 w-4" />} label="Live or piloting" value={stats.live} hint={`${stats.total ? Math.round(stats.live / stats.total * 100) : 0}% of portfolio`} />
        <KpiCard icon={<Sparkles className="h-4 w-4" />} label="Avg. effectiveness" value={`${stats.avg}/100`} hint="Composite score" />
        <KpiCard icon={<ShieldCheck className="h-4 w-4" />} label="Investment scope" value={`${stats.totalCost}k€`} hint="Sum of estimated cost" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <Card className="glass-card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-semibold">Average effectiveness by phase</h3>
            <span className="text-xs text-muted-foreground">0–100 composite</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPhase}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="phase" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                  {byPhase.map((_, i) => <Cell key={i} fill={phaseFill[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card p-5">
          <h3 className="font-semibold mb-4">Dimension profile</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dim" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={10} angle={90} domain={[0, 100]} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold">Top-ranked initiatives</h3>
        <a href="/initiatives" className="text-xs text-primary hover:underline">View all →</a>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {top.map((i) => <InitiativeCard key={i.id} initiative={i} />)}
      </div>

      <InitiativeDialog open={dlg} onOpenChange={setDlg} initiativeId={null} />
    </AppLayout>
  );
}

function KpiCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint: string }) {
  return (
    <Card className="glass-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
        {icon}{label}
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </Card>
  );
}
