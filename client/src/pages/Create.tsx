import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useWorkflowStore } from "../stores/workflowStore";
import { EXAMPLE_PROMPT } from "../types/workflow";

export default function Create() {
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { setWorkflow, setLoading, setError, loading, error } = useWorkflowStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const workflow = await api.parseDescription(description.trim());
      const saved = await api.createWorkflow(workflow);
      setWorkflow(saved);
      navigate("/editor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const useExample = () => setDescription(EXAMPLE_PROMPT);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-14">
      <div className="mb-10">
        <span className="font-mono text-xs text-brand-400 tracking-widest uppercase">Step 01</span>
        <h1 className="wf-page-title mt-2">Describe your process</h1>
        <p className="wf-page-sub">
          Write it like you'd explain it to a colleague. Wayflow handles the structure.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="wf-label">Process description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            placeholder="When a support ticket arrives, classify urgency with AI..."
            className="wf-textarea"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="wf-btn wf-btn-primary"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {loading ? "Mapping..." : "Generate workflow"}
          </button>
          <button onClick={useExample} className="wf-btn wf-btn-ghost">
            Load example
          </button>
        </div>

        {error && <div className="wf-error">{error}</div>}
      </div>
    </div>
  );
}
