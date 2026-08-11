import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import WorkflowCanvas from "../components/canvas/WorkflowCanvas";
import Logo from "../components/Logo";
import { api } from "../api/client";
import type { Workflow } from "../types/workflow";

export default function ShareView() {
  const { token } = useParams<{ token: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getSharedWorkflow(token)
      .then(setWorkflow)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-10 h-10 text-cream-dim mb-4" />
        <h1 className="font-display text-xl font-bold text-cream mb-2">Link not found</h1>
        <p className="text-cream-muted text-sm mb-6">This shared workflow may have been revoked.</p>
        <Link to="/" className="wf-btn wf-btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Go to Wayflow
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink wf-dot-grid flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-400">Shared workflow</p>
            <h1 className="font-display font-bold text-cream">{workflow.name}</h1>
          </div>
        </div>
        <Link to="/" className="wf-btn wf-btn-secondary text-sm !py-2 !px-3">
          Open Wayflow
        </Link>
      </header>

      {workflow.description && (
        <p className="px-5 py-3 text-sm text-cream-muted border-b border-border bg-surface/40">
          {workflow.description}
        </p>
      )}

      <div className="flex-1 p-4 md:p-6">
        <WorkflowCanvas workflow={workflow} readOnly />
      </div>

      <footer className="px-5 py-3 border-t border-border text-center">
        <p className="text-xs text-cream-dim font-mono">Read-only view · Powered by Wayflow</p>
      </footer>
    </div>
  );
}
