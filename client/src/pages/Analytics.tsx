import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CheckCircle,
  GitBranch,
  Link2,
  Loader2,
  Play,
  TrendingUp,
} from "lucide-react";
import { api, type AnalyticsData } from "../api/client";
import { NODE_LABELS, type NodeType } from "../types/workflow";

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="wf-empty">
        <p className="text-cream-muted">{error ?? "Failed to load analytics"}</p>
      </div>
    );
  }

  const maxRuns = Math.max(...data.runsByDay.map((d) => d.count), 1);
  const nodeEntries = Object.entries(data.nodeTypeCounts).sort((a, b) => b[1] - a[1]);
  const maxNodes = Math.max(...nodeEntries.map(([, c]) => c), 1);

  const statCards = [
    { label: "Workflows", value: data.workflowCount, icon: GitBranch, color: "#38bdf8" },
    { label: "Simulations", value: data.runCount, icon: Play, color: "#a78bfa" },
    { label: "Success rate", value: `${data.successRate}%`, icon: TrendingUp, color: "#34d399" },
    { label: "Shared links", value: data.sharedCount, icon: Link2, color: "#f472b6" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <div className="mb-10">
        <span className="font-mono text-xs text-brand-400 tracking-widest uppercase">Insights</span>
        <h1 className="wf-page-title mt-2">Analytics</h1>
        <p className="wf-page-sub">Workflow usage, simulation trends, and activity at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="wf-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream-dim">{label}</span>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="font-display text-3xl font-bold text-cream">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Runs chart */}
        <div className="wf-panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-brand-400" />
            <h2 className="font-display font-bold text-cream">Runs — last 7 days</h2>
          </div>
          <div className="flex items-end gap-2 h-36">
            {data.runsByDay.map(({ date, count }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                  style={{ height: `${Math.max((count / maxRuns) * 100, count > 0 ? 8 : 2)}%` }}
                />
                <span className="font-mono text-[9px] text-cream-dim">
                  {new Date(date).toLocaleDateString("en", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="wf-panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-sage-400" />
            <h2 className="font-display font-bold text-cream">Run outcomes</h2>
          </div>
          <div className="space-y-4">
            {(
              [
                { key: "completed", label: "Completed", color: "#34d399" },
                { key: "escalated", label: "Escalated", color: "#fbbf24" },
                { key: "failed", label: "Failed", color: "#f87171" },
              ] as const
            ).map(({ key, label, color }) => {
              const count = data.statusCounts[key];
              const pct = data.runCount > 0 ? Math.round((count / data.runCount) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-cream-muted">{label}</span>
                    <span className="font-mono text-cream-dim">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Node usage */}
        <div className="wf-panel p-6">
          <h2 className="font-display font-bold text-cream mb-5">Node type usage</h2>
          <div className="space-y-3">
            {nodeEntries.length === 0 ? (
              <p className="text-sm text-cream-dim">No workflows yet.</p>
            ) : (
              nodeEntries.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-cream-muted w-28 shrink-0">
                    {NODE_LABELS[type as NodeType] ?? type}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400"
                      style={{ width: `${(count / maxNodes) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-cream-dim w-6 text-right">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="wf-panel p-6">
          <h2 className="font-display font-bold text-cream mb-5">Recent activity</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.recentRuns.length === 0 ? (
              <p className="text-sm text-cream-dim">No simulations run yet. Try the Simulate page.</p>
            ) : (
              data.recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/50 border border-border"
                >
                  <CheckCircle
                    className={`w-4 h-4 shrink-0 ${
                      run.status === "completed"
                        ? "text-sage-400"
                        : run.status === "escalated"
                          ? "text-brand-400"
                          : "text-red-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cream truncate">{run.workflowName}</p>
                    <p className="text-xs text-cream-dim font-mono">
                      {run.stepCount} steps · {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-cream-dim">{run.status}</span>
                </div>
              ))
            )}
          </div>

          {data.topWorkflows.length > 0 && (
            <div className="mt-6 pt-5 border-t border-border">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-3">
                Most run workflows
              </h3>
              {data.topWorkflows.map((wf) => (
                <div key={wf.id} className="flex justify-between text-sm py-1.5">
                  <Link to="/editor" className="text-cream-muted hover:text-brand-400 transition-colors truncate">
                    {wf.name}
                  </Link>
                  <span className="font-mono text-cream-dim shrink-0 ml-2">{wf.runCount} runs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
