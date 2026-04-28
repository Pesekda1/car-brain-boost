import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { LAYERS, PHASES, STATUS_META, type Layer, type PhaseId, type Status } from "@/lib/evaluation-types";
import { InitiativeCard } from "@/components/InitiativeCard";
import { InitiativeDialog } from "@/components/InitiativeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Initiatives() {
  const initiatives = useEvaluationStore((s) => s.initiatives);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState<PhaseId | "all">("all");
  const [layer, setLayer] = useState<Layer | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");

  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      if (phase !== "all" && i.phase !== phase) return false;
      if (layer !== "all" && i.layer !== layer) return false;
      if (status !== "all" && i.status !== status) return false;
      if (q && !`${i.name} ${i.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [initiatives, q, phase, layer, status]);

  const openEdit = (id: string) => { setEditing(id); setOpen(true); };
  const openNew = () => { setEditing(null); setOpen(true); };

  return (
    <AppLayout
      title="AI Initiatives"
      subtitle={`${initiatives.length} initiative${initiatives.length !== 1 ? "s" : ""} in the evaluation pipeline`}
      actions={<Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />New initiative</Button>}
    >
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search initiatives…" className="pl-9" />
        </div>
        <Select value={phase} onValueChange={(v) => setPhase(v as any)}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Phase" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All phases</SelectItem>
            {PHASES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={layer} onValueChange={(v) => setLayer(v as any)}>
          <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Layer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All layers</SelectItem>
            {LAYERS.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Tabs value={status} onValueChange={(v) => setStatus(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {(["evaluating", "piloting", "in-production"] as Status[]).map((s) => (
              <TabsTrigger key={s} value={s}>{STATUS_META[s].label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="text-muted-foreground mb-3">No initiatives match these filters.</div>
          <Button variant="outline" onClick={openNew}>Create the first one</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <InitiativeCard key={i.id} initiative={i} onClick={() => openEdit(i.id)} />)}
        </div>
      )}

      <InitiativeDialog open={open} onOpenChange={setOpen} initiativeId={editing} />
    </AppLayout>
  );
}
