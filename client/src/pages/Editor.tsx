import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Save, Play, MapPin, Link2 } from "lucide-react";
import WorkflowCanvas from "../components/canvas/WorkflowCanvas";
import ShareModal from "../components/ShareModal";
import { api } from "../api/client";
import { useWorkflowStore } from "../stores/workflowStore";
import type { Workflow } from "../types/workflow";

export default function Editor() {
  const { workflow, setWorkflow, loading, setLoading, setError, error } = useWorkflowStore();
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!workflow) {
      api.getWorkflows().then((workflows) => {
        if (workflows.length > 0) setWorkflow(workflows[0]);
      }).catch(() => {});
    }
  }, [workflow, setWorkflow]);

  const handleChange = (updated: Workflow) => {
    setWorkflow(updated);
  };

  const handleSave = async () => {
    if (!workflow?.id) return;
    setLoading(true);
    setError(null);
    try {
      const saved = await api.updateWorkflow(workflow.id, workflow);
      setWorkflow(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!workflow) {
    return (
      <div className="wf-empty">
        <MapPin className="w-10 h-10 text-cream-dim mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-cream mb-2">No path mapped yet</h2>
        <p className="text-cream-muted mb-6">Describe a process or clone a template to get started.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/create" className="wf-btn wf-btn-primary">Start describing</Link>
          <Link to="/templates" className="wf-btn wf-btn-secondary">Browse templates</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-0px)] md:h-screen flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur">
        <div>
          <span className="font-mono text-[10px] text-brand-400 tracking-widest uppercase">Step 02</span>
          <h1 className="font-display text-lg font-bold text-cream">{workflow.name}</h1>
          <p className="text-sm text-cream-muted">{workflow.description || "Drag nodes to refine the path"}</p>
        </div>
        <div className="flex items-center gap-2">
          {workflow.id && (
            <button
              onClick={() => setShowShare(true)}
              className="wf-btn wf-btn-secondary text-sm !py-2 !px-3"
            >
              <Link2 className="w-3.5 h-3.5" />
              Share
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !workflow.id}
            className="wf-btn wf-btn-secondary text-sm !py-2 !px-3"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <Link to="/simulate" className="wf-btn wf-btn-primary text-sm !py-2 !px-3">
            <Play className="w-3.5 h-3.5" />
            Run
          </Link>
        </div>
      </div>

      {error && <div className="mx-5 mt-3 wf-error">{error}</div>}

      <div className="flex-1 p-4 md:p-5">
        <WorkflowCanvas workflow={workflow} onChange={handleChange} />
      </div>

      {showShare && workflow.id && (
        <ShareModal workflowId={workflow.id} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
