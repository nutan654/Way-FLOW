import { create } from "zustand";
import type { SimulationResult, Workflow } from "../types/workflow";

interface WorkflowState {
  workflow: Workflow | null;
  simulation: SimulationResult | null;
  docs: string;
  tests: string;
  loading: boolean;
  error: string | null;

  setWorkflow: (workflow: Workflow | null) => void;
  setSimulation: (simulation: SimulationResult | null) => void;
  setDocs: (docs: string) => void;
  setTests: (tests: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflow: null,
  simulation: null,
  docs: "",
  tests: "",
  loading: false,
  error: null,

  setWorkflow: (workflow) => set({ workflow }),
  setSimulation: (simulation) => set({ simulation }),
  setDocs: (docs) => set({ docs }),
  setTests: (tests) => set({ tests }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      workflow: null,
      simulation: null,
      docs: "",
      tests: "",
      loading: false,
      error: null,
    }),
}));
