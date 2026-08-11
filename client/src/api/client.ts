import type { SimulationResult, Workflow } from "../types/workflow";

// If VITE_API_URL is set (e.g. deploying the client separately from the API),
// requests go to that origin. Otherwise falls back to a relative "/api" path,
// which works when the API serves the built client itself, or when both are
// deployed together behind the same origin (e.g. Vercel full-stack).
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const BASE = `${API_ORIGIN}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  accent: string;
}

export interface TemplateDetail extends TemplateSummary {
  workflow: Workflow;
}

export interface AnalyticsData {
  workflowCount: number;
  runCount: number;
  sharedCount: number;
  successRate: number;
  statusCounts: { completed: number; failed: number; escalated: number };
  runsByDay: { date: string; count: number }[];
  nodeTypeCounts: Record<string, number>;
  topWorkflows: { id: string; name: string; runCount: number; lastRun: string | null }[];
  recentRuns: {
    id: string;
    workflowId: string;
    workflowName: string;
    status: string;
    stepCount: number;
    createdAt: string;
  }[];
}

export const api = {
  getWorkflows: () => request<Workflow[]>("/workflows"),
  getWorkflow: (id: string) => request<Workflow>(`/workflows/${id}`),
  createWorkflow: (workflow: Workflow) =>
    request<Workflow>("/workflows", { method: "POST", body: JSON.stringify(workflow) }),
  updateWorkflow: (id: string, workflow: Workflow) =>
    request<Workflow>(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(workflow) }),
  deleteWorkflow: (id: string) =>
    request<void>(`/workflows/${id}`, { method: "DELETE" }),

  createShareLink: (id: string) =>
    request<{ shareToken: string; shareUrl: string }>(`/workflows/${id}/share`, { method: "POST" }),
  revokeShareLink: (id: string) =>
    request<void>(`/workflows/${id}/share`, { method: "DELETE" }),
  getSharedWorkflow: (token: string) => request<Workflow>(`/share/${token}`),

  getTemplates: () => request<TemplateSummary[]>("/analytics/templates"),
  getTemplate: (id: string) => request<TemplateDetail>(`/analytics/templates/${id}`),
  getAnalytics: () => request<AnalyticsData>("/analytics"),

  parseDescription: (description: string) =>
    request<Workflow>("/ai/parse", { method: "POST", body: JSON.stringify({ description }) }),

  generateDocs: (workflow: Workflow) =>
    request<{ markdown: string }>("/ai/document", {
      method: "POST",
      body: JSON.stringify({ workflow }),
    }),

  generateTests: (workflow: Workflow) =>
    request<{ code: string }>("/ai/tests", {
      method: "POST",
      body: JSON.stringify({ workflow }),
    }),

  simulate: (workflow: Workflow, input?: Record<string, unknown>) =>
    request<SimulationResult>("/simulation/run", {
      method: "POST",
      body: JSON.stringify({ workflow, input }),
    }),

  simulateRecorded: (id: string, input?: Record<string, unknown>) =>
    request<SimulationResult>(`/simulation/run/${id}`, {
      method: "POST",
      body: JSON.stringify({ input }),
    }),

  validate: (workflow: Workflow) =>
    request<{ valid: boolean; errors: { field: string; message: string }[] }>(
      "/simulation/validate",
      { method: "POST", body: JSON.stringify(workflow) },
    ),
};
