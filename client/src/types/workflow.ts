export type NodeType =
  | "trigger"
  | "ai_classify"
  | "condition"
  | "action"
  | "delay"
  | "escalate";

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id?: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  action: string;
  output?: Record<string, unknown>;
  timestamp: number;
}

export interface SimulationResult {
  workflowId: string;
  input: Record<string, unknown>;
  steps: SimulationStep[];
  status: "completed" | "failed" | "escalated";
  finalOutput: Record<string, unknown>;
}

export const NODE_COLORS: Record<NodeType, string> = {
  trigger: "#34d399",
  ai_classify: "#38bdf8",
  condition: "#a78bfa",
  action: "#60a5fa",
  delay: "#64748b",
  escalate: "#f472b6",
};

export const NODE_LABELS: Record<NodeType, string> = {
  trigger: "Trigger",
  ai_classify: "AI Classify",
  condition: "Condition",
  action: "Action",
  delay: "Delay",
  escalate: "Escalate",
};

export const EXAMPLE_PROMPT = `When a support ticket arrives, classify urgency with AI, notify Slack if high priority, auto-reply with FAQ if low priority, and escalate to a senior agent if no response within 2 hours.`;

export const EXAMPLE_INPUT = {
  ticketId: "TKT-1042",
  customer: "Jane Doe",
  message: "My account is locked and I can't access billing. This is urgent!",
  email: "jane@example.com",
};
