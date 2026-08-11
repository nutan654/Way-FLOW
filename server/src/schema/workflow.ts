import { z } from "zod";

export const NodeTypeSchema = z.enum([
  "trigger",
  "ai_classify",
  "condition",
  "action",
  "delay",
  "escalate",
]);

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  label: z.string(),
  config: z.record(z.unknown()),
  position: z.object({ x: z.number(), y: z.number() }),
});

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const WorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  nodes: z.array(WorkflowNodeSchema).min(1),
  edges: z.array(WorkflowEdgeSchema),
});

export type NodeType = z.infer<typeof NodeTypeSchema>;
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;

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

export const EXAMPLE_WORKFLOW: Workflow = {
  name: "Support Ticket Triage",
  description: "Auto-classify and route support tickets by urgency",
  nodes: [
    {
      id: "n1",
      type: "trigger",
      label: "New Ticket",
      config: { event: "ticket.created" },
      position: { x: 250, y: 0 },
    },
    {
      id: "n2",
      type: "ai_classify",
      label: "Classify Urgency",
      config: {
        field: "message",
        categories: ["low", "medium", "high"],
      },
      position: { x: 250, y: 120 },
    },
    {
      id: "n3",
      type: "condition",
      label: "Is High Priority?",
      config: { field: "urgency", operator: "equals", value: "high" },
      position: { x: 80, y: 240 },
    },
    {
      id: "n4",
      type: "action",
      label: "Notify Slack",
      config: {
        channel: "#support-urgent",
        template: "High priority ticket received!",
      },
      position: { x: 80, y: 360 },
    },
    {
      id: "n5",
      type: "action",
      label: "Auto-reply FAQ",
      config: { template: "Thanks! We'll respond within 24 hours." },
      position: { x: 420, y: 360 },
    },
    {
      id: "n6",
      type: "delay",
      label: "Wait 2 Hours",
      config: { duration: "2h" },
      position: { x: 250, y: 480 },
    },
    {
      id: "n7",
      type: "escalate",
      label: "Escalate to Senior",
      config: { assignTo: "senior-agent" },
      position: { x: 250, y: 600 },
    },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n2", target: "n3" },
    { id: "e3", source: "n3", target: "n4", label: "true" },
    { id: "e4", source: "n2", target: "n5", label: "low" },
    { id: "e5", source: "n4", target: "n6" },
    { id: "e6", source: "n6", target: "n7" },
  ],
};

export const EXAMPLE_INPUT = {
  ticketId: "TKT-1042",
  customer: "Jane Doe",
  message: "My account is locked and I can't access billing. This is urgent!",
  email: "jane@example.com",
};
