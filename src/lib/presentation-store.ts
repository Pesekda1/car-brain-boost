import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PresentationLayerId } from "./presentation-layers";

export interface Vote {
  voter: string;
  feasibility: number; // 1-10
  impact: number;      // 1-10
  comment?: string;
  ts: number;
}

interface State {
  /** key = `${layerId}::${useCaseTitle}` */
  votes: Record<string, Vote[]>;
  decisions: Record<PresentationLayerId, string>; // free-form decision per layer
  addVote: (layerId: PresentationLayerId, useCase: string, vote: Vote) => void;
  clearVotes: (layerId: PresentationLayerId, useCase: string) => void;
  setDecision: (layerId: PresentationLayerId, text: string) => void;
  resetAll: () => void;
}

const key = (l: string, u: string) => `${l}::${u}`;

export const usePresentationStore = create<State>()(
  persist(
    (set) => ({
      votes: {},
      decisions: { "in-car": "", transport: "", blending: "", business: "" },
      addVote: (l, u, vote) =>
        set((s) => ({
          votes: { ...s.votes, [key(l, u)]: [...(s.votes[key(l, u)] ?? []), vote] },
        })),
      clearVotes: (l, u) =>
        set((s) => {
          const next = { ...s.votes };
          delete next[key(l, u)];
          return { votes: next };
        }),
      setDecision: (l, text) =>
        set((s) => ({ decisions: { ...s.decisions, [l]: text } })),
      resetAll: () =>
        set({ votes: {}, decisions: { "in-car": "", transport: "", blending: "", business: "" } }),
    }),
    { name: "presentation-state-v1" }
  )
);

export const voteKey = key;
