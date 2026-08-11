import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, MapPin } from "lucide-react";
import SimulationPanel from "../components/simulation/SimulationPanel";
import { api } from "../api/client";
import { useWorkflowStore } from "../stores/workflowStore";
import { EXAMPLE_INPUT } from "../types/workflow";

export default function Simulate() {
  const { workflow, simulation, setSimulation, loading, setLoading, setError, error } =
    useWorkflowStore();
  const [inputJson, setInputJson] = useState(JSON.stringify(EXAMPLE_INPUT, null, 2));

  const handleRun = async () => {
    if (!workflow) return;
    setLoading(true);
    setError(null);
    try {
      let input: Record<string, unknown>;
      try {
        input = JSON.parse(inputJson);
      } catch {
        throw new Error("Invalid JSON input");
      }
      const result = workflow.id
        ? await api.simulateRecorded(workflow.id, input)
        : await api.simulate(workflow, input);
      setSimulation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!workflow) {
    return (
      <div className="wf-empty">
        <MapPin className="w-10 h-10 text-cream-dim mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-cream mb-2">Nothing to walk through</h2>
        <Link to="/create" className="text-brand-400 hover:text-brand-300 text-sm">
          Map a process first →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs text-brand-400 tracking-widest uppercase">Step 03</span>
          <h1 className="wf-page-title mt-2">Walk the path</h1>
          <p className="wf-page-sub">Running "{workflow.name}" with test data</p>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="wf-btn wf-btn-primary shrink-0"
        >
          <Play className="w-4 h-4" />
          {loading ? "Walking..." : "Run simulation"}
        </button>
      </div>

      {error && <div className="wf-error mb-5">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <label className="wf-label">Test input (JSON)</label>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            rows={14}
            className="wf-textarea wf-input-mono"
          />
        </div>
        <div>
          <label className="wf-label">Execution trail</label>
          <div className="wf-panel p-4 min-h-[360px]">
            <SimulationPanel result={simulation} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
