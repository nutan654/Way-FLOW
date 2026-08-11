import type { SimulationResult } from "../../types/workflow";
import { CheckCircle, AlertTriangle, Footprints } from "lucide-react";
import { NODE_COLORS } from "../../types/workflow";

interface Props {
  result: SimulationResult | null;
  loading?: boolean;
}

export default function SimulationPanel({ result, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-cream-muted">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm">Walking the path...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-cream-dim">
        <Footprints className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-sm font-mono">Run a simulation to see the trail</p>
      </div>
    );
  }

  const statusIcon = {
    completed: <CheckCircle className="w-4 h-4 text-sage-400" />,
    escalated: <AlertTriangle className="w-4 h-4 text-brand-400" />,
    failed: <AlertTriangle className="w-4 h-4 text-red-400" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
        {statusIcon[result.status]}
        <div>
          <div className="text-sm font-medium text-cream capitalize font-display">{result.status}</div>
          <div className="text-xs text-cream-dim font-mono">{result.steps.length} steps walked</div>
        </div>
      </div>

      <div className="space-y-2">
        {result.steps.map((step, i) => (
          <div
            key={`${step.nodeId}-${i}`}
            className="flex gap-3 p-3 rounded-xl bg-surface-2/50 border border-border hover:border-border-light transition-colors"
          >
            <div className="flex flex-col items-center shrink-0 pt-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: NODE_COLORS[step.nodeType] }}
              />
              {i < result.steps.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-cream">{step.nodeLabel}</span>
                <span className="text-[10px] uppercase tracking-widest text-cream-dim font-mono">
                  {step.nodeType}
                </span>
              </div>
              <p className="text-sm text-cream-muted">{step.action}</p>
              {step.output && Object.keys(step.output).length > 0 && (
                <pre className="mt-2 text-xs text-cream-dim bg-ink rounded-lg p-2 overflow-x-auto font-mono">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              )}
            </div>
            <span className="text-xs text-cream-dim font-mono shrink-0 pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      {Object.keys(result.finalOutput).length > 0 && (
        <div className="p-3 rounded-xl bg-surface-2 border border-border">
          <div className="text-[10px] uppercase tracking-widest text-cream-dim mb-2 font-mono">
            Final output
          </div>
          <pre className="text-xs text-cream-muted overflow-x-auto font-mono">
            {JSON.stringify(result.finalOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
