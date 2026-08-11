import type {
  NodeType,
  SimulationResult,
  SimulationStep,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
} from "../schema/workflow.js";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateWorkflow(workflow: Workflow): ValidationError[] {
  const errors: ValidationError[] = [];

  const triggers = workflow.nodes.filter((n) => n.type === "trigger");
  if (triggers.length === 0) {
    errors.push({ field: "nodes", message: "Workflow must have at least one trigger node" });
  }
  if (triggers.length > 1) {
    errors.push({ field: "nodes", message: "Workflow must have exactly one trigger node" });
  }

  const nodeIds = new Set(workflow.nodes.map((n) => n.id));
  for (const edge of workflow.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({ field: "edges", message: `Edge ${edge.id} references missing source node ${edge.source}` });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({ field: "edges", message: `Edge ${edge.id} references missing target node ${edge.target}` });
    }
  }

  const connected = new Set<string>();
  for (const edge of workflow.edges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }
  for (const node of workflow.nodes) {
    if (node.type !== "trigger" && !connected.has(node.id)) {
      errors.push({ field: "nodes", message: `Node "${node.label}" (${node.id}) is disconnected` });
    }
  }

  return errors;
}

function classifyUrgency(message: string): string {
  const lower = message.toLowerCase();
  const highKeywords = ["urgent", "critical", "emergency", "locked", "down", "broken", "asap"];
  const lowKeywords = ["question", "how to", "wondering", "faq", "info"];

  if (highKeywords.some((k) => lower.includes(k))) return "high";
  if (lowKeywords.some((k) => lower.includes(k))) return "low";
  return "medium";
}

function evaluateCondition(
  config: Record<string, unknown>,
  context: Record<string, unknown>,
): boolean {
  const field = config.field as string;
  const operator = config.operator as string;
  const value = config.value;
  const actual = context[field];

  switch (operator) {
    case "equals":
      return actual === value;
    case "not_equals":
      return actual !== value;
    case "contains":
      return String(actual).includes(String(value));
    default:
      return false;
  }
}

function getNextNodes(
  currentId: string,
  edges: WorkflowEdge[],
  context: Record<string, unknown>,
  fromNode?: WorkflowNode,
): string[] {
  const outgoing = edges.filter((e) => e.source === currentId);

  if (fromNode?.type === "condition") {
    const result = evaluateCondition(fromNode.config, context);
    const match = outgoing.find((e) => e.label === (result ? "true" : "false"));
    return match ? [match.target] : outgoing.map((e) => e.target);
  }

  if (fromNode?.type === "ai_classify") {
    const urgency = context.urgency as string;
    const labeled = outgoing.find((e) => e.label === urgency);
    if (labeled) return [labeled.target];
  }

  return outgoing.map((e) => e.target);
}

function executeNode(
  node: WorkflowNode,
  context: Record<string, unknown>,
): { action: string; output: Record<string, unknown> } {
  switch (node.type as NodeType) {
    case "trigger":
      return {
        action: `Triggered by: ${node.config.event ?? "manual"}`,
        output: { ...context },
      };

    case "ai_classify": {
      const message = String(context.message ?? context[inputField(node)] ?? "");
      const urgency = classifyUrgency(message);
      return {
        action: `AI classified urgency as "${urgency}"`,
        output: { urgency, confidence: 0.87 },
      };
    }

    case "condition": {
      const result = evaluateCondition(node.config, context);
      return {
        action: `Condition "${node.label}" evaluated to ${result}`,
        output: { conditionResult: result },
      };
    }

    case "action":
      return {
        action: `Executed: ${node.label} — ${node.config.template ?? node.config.channel ?? "action"}`,
        output: { actionCompleted: true, actionType: node.label },
      };

    case "delay":
      return {
        action: `Waiting ${node.config.duration ?? "unknown"}`,
        output: { delayed: true, duration: node.config.duration },
      };

    case "escalate":
      return {
        action: `Escalated to ${node.config.assignTo ?? "supervisor"}`,
        output: { escalated: true, assignTo: node.config.assignTo },
      };

    default:
      return { action: "Unknown node type", output: {} };
  }
}

function inputField(node: WorkflowNode): string {
  return (node.config.field as string) ?? "message";
}

export function simulateWorkflow(
  workflowId: string,
  workflow: Workflow,
  input: Record<string, unknown>,
): SimulationResult {
  const errors = validateWorkflow(workflow);
  if (errors.length > 0) {
    throw new Error(`Invalid workflow: ${errors.map((e) => e.message).join("; ")}`);
  }

  const steps: SimulationStep[] = [];
  const context: Record<string, unknown> = { ...input };
  let status: SimulationResult["status"] = "completed";

  const trigger = workflow.nodes.find((n) => n.type === "trigger");
  if (!trigger) throw new Error("No trigger node found");

  const queue: string[] = [trigger.id];
  const visited = new Set<string>();
  let stepTime = Date.now();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const { action, output } = executeNode(node, context);
    Object.assign(context, output);

    steps.push({
      nodeId: node.id,
      nodeLabel: node.label,
      nodeType: node.type,
      action,
      output,
      timestamp: stepTime,
    });
    stepTime += 100;

    if (node.type === "escalate") {
      status = "escalated";
      break;
    }

    const nextIds = getNextNodes(nodeId, workflow.edges, context, node);
    queue.push(...nextIds);
  }

  return {
    workflowId,
    input,
    steps,
    status,
    finalOutput: context,
  };
}
