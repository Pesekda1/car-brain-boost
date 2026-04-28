import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIMENSIONS, LAYERS, OPS_LEVELS, PHASES, STATUS_META, type Initiative, type Layer, type OpsLevel, type PhaseId, type Status } from "@/lib/evaluation-types";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { Trash2 } from "lucide-react";

const blank: Omit<Initiative, "id" | "createdAt"> = {
  name: "", description: "",
  phase: "ingest", layer: "platform", level: "tactical", status: "idea", approach: "build",
  estCost: 100, estRoi: 150,
  scores: { businessImpact: 5, operationalEfficiency: 5, riskCompliance: 5, feasibility: 5, latency: 5, bandwidth: 5, safety: 5 },
  notes: "",
};

export function InitiativeDialog({ open, onOpenChange, initiativeId }: { open: boolean; onOpenChange: (o: boolean) => void; initiativeId: string | null }) {
  const { initiatives, add, update, remove } = useEvaluationStore();
  const existing = initiativeId ? initiatives.find((i) => i.id === initiativeId) : null;
  const [draft, setDraft] = useState(blank);

  useEffect(() => {
    if (existing) {
      const { id, createdAt, ...rest } = existing;
      setDraft(rest);
    } else setDraft(blank);
  }, [existing, open]);

  const save = () => {
    if (!draft.name.trim()) return;
    if (initiativeId) update(initiativeId, draft);
    else add(draft);
    onOpenChange(false);
  };

  const setScore = (k: keyof typeof draft.scores, v: number) =>
    setDraft((d) => ({ ...d, scores: { ...d.scores, [k]: v } }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initiativeId ? "Edit AI initiative" : "New AI initiative"}</DialogTitle>
          <DialogDescription>Capture the opportunity and score it across the four evaluation dimensions.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. LLM-assisted contract review" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Phase</Label>
              <Select
                value={draft.phase}
                onValueChange={(v: PhaseId) => {
                  const meta = PHASES.find((p) => p.id === v);
                  setDraft({ ...draft, phase: v, layer: meta?.defaultLayer ?? draft.layer });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PHASES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Layer</Label>
              <Select value={draft.layer} onValueChange={(v: Layer) => setDraft({ ...draft, layer: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LAYERS.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Ops level</Label>
              <Select value={draft.level} onValueChange={(v: OpsLevel) => setDraft({ ...draft, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OPS_LEVELS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v: Status) => setDraft({ ...draft, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Approach</Label>
              <Select value={draft.approach} onValueChange={(v: any) => setDraft({ ...draft, approach: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="build">Build</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Est. cost (k€)</Label>
              <Input type="number" value={draft.estCost} onChange={(e) => setDraft({ ...draft, estCost: +e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Est. ROI (%)</Label>
              <Input type="number" value={draft.estRoi} onChange={(e) => setDraft({ ...draft, estRoi: +e.target.value })} />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4 bg-secondary/30">
            <div className="text-sm font-medium">Effectiveness scoring (0–10)</div>
            {DIMENSIONS.map((d) => (
              <div key={d.id} className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{d.label}</Label>
                  <span className="text-sm font-mono text-primary">{draft.scores[d.id]}</span>
                </div>
                <Slider min={0} max={10} step={1} value={[draft.scores[d.id]]} onValueChange={([v]) => setScore(d.id, v)} />
                <p className="text-xs text-muted-foreground">{d.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          {initiativeId && (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { remove(initiativeId); onOpenChange(false); }}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name.trim()}>Save initiative</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
