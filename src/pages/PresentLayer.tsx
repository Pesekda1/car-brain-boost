import { useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getLayer, PRESENTATION_LAYERS } from "@/lib/presentation-layers";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { effectivenessScore } from "@/lib/evaluation-types";
import { usePresentationStore, voteKey } from "@/lib/presentation-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check, X, Clock, Zap, Vote, Trash2 } from "lucide-react";

export default function PresentLayer() {
  const { layerId } = useParams<{ layerId: string }>();
  const layer = layerId ? getLayer(layerId) : undefined;
  if (!layer) return <Navigate to="/present" replace />;

  const idx = PRESENTATION_LAYERS.findIndex((l) => l.id === layer.id);
  const prev = PRESENTATION_LAYERS[idx - 1];
  const next = PRESENTATION_LAYERS[idx + 1];

  const initiatives = useEvaluationStore((s) => s.initiatives);
  const linkedInitiatives = initiatives.filter((i) => layer.phases.includes(i.phase));

  const { votes, addVote, clearVotes, decisions, setDecision } = usePresentationStore();
  const [voteState, setVoteState] = useState<{ uc: string | null; voter: string; impact: number; feasibility: number; comment: string }>({
    uc: null, voter: "", impact: 7, feasibility: 7, comment: "",
  });

  // Scenario simulator state
  const [sim, setSim] = useState<Record<string, number>>(() =>
    Object.fromEntries(layer.scenario.inputs.map((i) => [i.id, i.default]))
  );
  const simResult = useMemo(() => layer.scenario.compute(sim), [sim, layer]);

  const horizonTone = (h: string) =>
    h === "now"
      ? "border-success/40 text-success"
      : h === "12-24m"
      ? "border-primary/40 text-primary"
      : "border-accent/40 text-accent";
  const horizonLabel = (h: string) => (h === "now" ? "Now" : h === "12-24m" ? "12-24 months" : "Future bet");

  const submitVote = (uc: string) => {
    if (!voteState.voter.trim()) return;
    addVote(layer.id, uc, {
      voter: voteState.voter.trim(),
      feasibility: voteState.feasibility,
      impact: voteState.impact,
      comment: voteState.comment.trim() || undefined,
      ts: Date.now(),
    });
    setVoteState({ uc: null, voter: voteState.voter, impact: 7, feasibility: 7, comment: "" });
  };

  return (
    <AppLayout
      title={`Layer ${layer.index} — ${layer.title}`}
      subtitle={layer.tagline}
      actions={
        <div className="flex items-center gap-1">
          {prev ? (
            <Button asChild variant="ghost" size="sm">
              <Link to={`/present/${prev.id}`}><ChevronLeft className="h-4 w-4 mr-1" />{prev.title}</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm"><Link to="/present"><ChevronLeft className="h-4 w-4 mr-1" />Hub</Link></Button>
          )}
          {next && (
            <Button asChild variant="ghost" size="sm">
              <Link to={`/present/${next.id}`}>{next.title}<ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-6">
        <Badge
          variant="outline"
          className={layer.audience === "exec" ? "border-accent/40 text-accent" : "border-primary/40 text-primary"}
        >
          {layer.audience === "exec" ? "Exec framing" : "Deep technical framing"}
        </Badge>
        <Badge variant="outline" className="border-border text-muted-foreground">
          {linkedInitiatives.length} linked initiatives
        </Badge>
      </div>

      {/* ARCHITECTURE DIAGRAM */}
      <section className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Architecture</h2>
            <p className="text-sm text-muted-foreground">Where in the stack this layer lives.</p>
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex items-stretch gap-3 min-w-max">
            {layer.architecture.map((node, i) => (
              <div key={node.id} className="flex items-center">
                <div
                  className="rounded-xl border p-4 w-52 bg-card"
                  style={{
                    borderColor: `hsl(var(--${layer.accent}) / 0.4)`,
                    boxShadow: `0 0 24px hsl(var(--${layer.accent}) / 0.08)`,
                  }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: `hsl(var(--${layer.accent}))` }}
                  >
                    Stage {i + 1}
                  </div>
                  <div className="font-semibold leading-tight mb-1">{node.label}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{node.sub}</div>
                </div>
                {i < layer.architecture.length - 1 && (
                  <ChevronRight className="h-5 w-5 mx-1 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE-CASE CARDS */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Candidate AI use-cases</h2>
        <p className="text-sm text-muted-foreground mb-4">Pros, cons, time horizon. Click <em>Score</em> to capture audience votes.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {layer.useCases.map((uc) => {
            const k = voteKey(layer.id, uc.title);
            const vs = votes[k] ?? [];
            const avgF = vs.length ? vs.reduce((a, v) => a + v.feasibility, 0) / vs.length : 0;
            const avgI = vs.length ? vs.reduce((a, v) => a + v.impact, 0) / vs.length : 0;
            const isOpen = voteState.uc === uc.title;
            return (
              <div key={uc.title} className="glass-card rounded-xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold leading-tight">{uc.title}</h3>
                  <Badge variant="outline" className={horizonTone(uc.horizon)}>
                    <Clock className="h-3 w-3 mr-1" />{horizonLabel(uc.horizon)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{uc.summary}</p>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-success mb-1.5">Pros</div>
                    <ul className="space-y-1">
                      {uc.pros.map((p) => (
                        <li key={p} className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" /><span className="text-muted-foreground">{p}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-destructive mb-1.5">Cons</div>
                    <ul className="space-y-1">
                      {uc.cons.map((c) => (
                        <li key={c} className="flex gap-1.5"><X className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" /><span className="text-muted-foreground">{c}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Impact </span>
                      <span className="font-mono text-primary">{avgI ? avgI.toFixed(1) : "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Feasibility </span>
                      <span className="font-mono text-primary">{avgF ? avgF.toFixed(1) : "—"}</span>
                    </div>
                    <div className="text-muted-foreground">({vs.length} votes)</div>
                  </div>
                  <div className="flex gap-1">
                    {vs.length > 0 && (
                      <Button size="sm" variant="ghost" onClick={() => clearVotes(layer.id, uc.title)} title="Clear votes">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isOpen ? "secondary" : "outline"}
                      onClick={() => setVoteState((s) => ({ ...s, uc: isOpen ? null : uc.title, impact: 7, feasibility: 7, comment: "" }))}
                    >
                      <Vote className="h-3.5 w-3.5 mr-1" />Score
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3 space-y-3">
                    <Input
                      placeholder="Your name / handle"
                      value={voteState.voter}
                      onChange={(e) => setVoteState((s) => ({ ...s, voter: e.target.value }))}
                      className="h-8 text-sm"
                    />
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Business impact</span><span className="font-mono text-primary">{voteState.impact}</span></div>
                      <Slider min={1} max={10} step={1} value={[voteState.impact]} onValueChange={([v]) => setVoteState((s) => ({ ...s, impact: v }))} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Feasibility</span><span className="font-mono text-primary">{voteState.feasibility}</span></div>
                      <Slider min={1} max={10} step={1} value={[voteState.feasibility]} onValueChange={([v]) => setVoteState((s) => ({ ...s, feasibility: v }))} />
                    </div>
                    <Textarea
                      placeholder="Comment (optional)"
                      value={voteState.comment}
                      onChange={(e) => setVoteState((s) => ({ ...s, comment: e.target.value }))}
                      className="text-sm min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => submitVote(uc.title)} disabled={!voteState.voter.trim()}>Submit vote</Button>
                      <Button size="sm" variant="ghost" onClick={() => setVoteState((s) => ({ ...s, uc: null }))}>Cancel</Button>
                    </div>
                    {vs.length > 0 && (
                      <div className="pt-2 border-t border-border space-y-1.5 max-h-40 overflow-y-auto">
                        {vs.map((v, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-semibold">{v.voter}</span>
                            <span className="text-muted-foreground"> · I {v.impact} / F {v.feasibility}</span>
                            {v.comment && <span className="text-muted-foreground"> — {v.comment}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SCENARIO SIMULATOR */}
      <section className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">{layer.scenario.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{layer.scenario.description}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {layer.scenario.inputs.map((input) => (
              <div key={input.id}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{input.label}</span>
                  <span className="font-mono text-primary">{sim[input.id].toLocaleString()} {input.unit}</span>
                </div>
                <Slider
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={[sim[input.id]]}
                  onValueChange={([v]) => setSim((s) => ({ ...s, [input.id]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 content-start">
            {simResult.map((r) => (
              <div
                key={r.label}
                className="rounded-xl border p-4"
                style={{
                  borderColor: r.tone === "good"
                    ? "hsl(var(--success) / 0.4)"
                    : r.tone === "bad"
                    ? "hsl(var(--destructive) / 0.4)"
                    : "hsl(var(--border))",
                  background: r.tone === "good" ? "hsl(var(--success) / 0.05)" : "transparent",
                }}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{r.label}</div>
                <div className={`text-xl font-bold ${r.tone === "good" ? "text-success" : ""}`}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LINKED INITIATIVES */}
      <section className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-1">Linked initiatives in our backlog</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Pulled from the evaluation workspace. Phases: {layer.phases.join(" + ")}.
        </p>
        {linkedInitiatives.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No initiatives in this layer yet.</p>
        ) : (
          <div className="grid gap-2">
            {linkedInitiatives.map((i) => (
              <Link
                key={i.id}
                to="/initiatives"
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{i.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{i.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="border-border text-muted-foreground capitalize">{i.status.replace("-", " ")}</Badge>
                  <span className="font-mono text-primary text-sm">{effectivenessScore(i.scores)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* DECISION CAPTURE */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">Discussion outcome</h2>
        <p className="text-sm text-muted-foreground mb-3">Capture the working decision for this layer. Saved locally.</p>
        <Textarea
          value={decisions[layer.id] ?? ""}
          onChange={(e) => setDecision(layer.id, e.target.value)}
          placeholder="e.g. Pursue edge compression in 2 OEM pilots. Park federated learning until 2027 review."
          className="min-h-[100px]"
        />
      </section>
    </AppLayout>
  );
}
