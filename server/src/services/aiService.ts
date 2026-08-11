import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import {
  EXAMPLE_WORKFLOW,
  WorkflowSchema,
  type Workflow,
} from "../schema/workflow.js";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const PARSE_SYSTEM_PROMPT = `You are a workflow architect. Convert business process descriptions into structured workflow JSON.

Rules:
- Use ONLY these node types: trigger, ai_classify, condition, action, delay, escalate
- Every workflow MUST start with exactly one trigger node
- Assign x,y positions spaced ~120px apart vertically, fan branches horizontally
- Return valid JSON with: name, description, nodes[], edges[]
- Each node needs: id, type, label, config, position {x,y}
- Each edge needs: id, source, target, optional label

Node config examples:
- trigger: { "event": "ticket.created" }
- ai_classify: { "field": "message", "categories": ["low","medium","high"] }
- condition: { "field": "urgency", "operator": "equals", "value": "high" }
- action: { "channel": "#slack", "template": "message text" }
- delay: { "duration": "2h" }
- escalate: { "assignTo": "senior-agent" }`;

function assignIds(workflow: Workflow): Workflow {
  const idMap = new Map<string, string>();
  const nodes = workflow.nodes.map((node, i) => {
    const newId = `n${i + 1}`;
    idMap.set(node.id, newId);
    return { ...node, id: newId };
  });
  const edges = workflow.edges.map((edge, i) => ({
    ...edge,
    id: `e${i + 1}`,
    source: idMap.get(edge.source) ?? edge.source,
    target: idMap.get(edge.target) ?? edge.target,
  }));
  return { ...workflow, nodes, edges };
}

function keywordParse(description: string): Workflow {
  const lower = description.toLowerCase();
  const hasEscalate = lower.includes("escalat");
  const hasSlack = lower.includes("slack") || lower.includes("notify");
  const hasDelay = lower.includes("hour") || lower.includes("wait");
  const hasClassify = lower.includes("classif") || lower.includes("urgency") || lower.includes("priority");

  if (!hasClassify && !hasSlack) {
    return assignIds({
      ...EXAMPLE_WORKFLOW,
      name: "Generated Workflow",
      description,
    });
  }

  const nodes: Workflow["nodes"] = [
    { id: "n1", type: "trigger", label: "Process Start", config: { event: "process.start" }, position: { x: 250, y: 0 } },
  ];
  const edges: Workflow["edges"] = [];
  let y = 120;
  let lastId = "n1";

  if (hasClassify) {
    nodes.push({
      id: "n2", type: "ai_classify", label: "AI Classification",
      config: { field: "message", categories: ["low", "medium", "high"] },
      position: { x: 250, y },
    });
    edges.push({ id: "e1", source: lastId, target: "n2" });
    lastId = "n2";
    y += 120;

    nodes.push({
      id: "n3", type: "condition", label: "High Priority?",
      config: { field: "urgency", operator: "equals", value: "high" },
      position: { x: 100, y },
    });
    edges.push({ id: "e2", source: lastId, target: "n3", label: "high" });
    y += 120;
    lastId = "n3";
  }

  if (hasSlack) {
    const slackId = `n${nodes.length + 1}`;
    nodes.push({
      id: slackId, type: "action", label: "Notify Slack",
      config: { channel: "#alerts", template: "Action required!" },
      position: { x: 100, y },
    });
    edges.push({ id: `e${edges.length + 1}`, source: lastId, target: slackId, label: "true" });
    lastId = slackId;
    y += 120;
  }

  const lowId = `n${nodes.length + 1}`;
  nodes.push({
    id: lowId, type: "action", label: "Standard Response",
    config: { template: "Request received. We'll follow up soon." },
    position: { x: 400, y: y - (hasSlack ? 120 : 0) },
  });
  if (hasClassify) {
    edges.push({ id: `e${edges.length + 1}`, source: "n2", target: lowId, label: "low" });
  }

  if (hasDelay) {
    const delayId = `n${nodes.length + 1}`;
    nodes.push({
      id: delayId, type: "delay", label: "Wait Period",
      config: { duration: "2h" },
      position: { x: 250, y },
    });
    edges.push({ id: `e${edges.length + 1}`, source: lastId, target: delayId });
    lastId = delayId;
    y += 120;
  }

  if (hasEscalate) {
    const escId = `n${nodes.length + 1}`;
    nodes.push({
      id: escId, type: "escalate", label: "Escalate",
      config: { assignTo: "senior-agent" },
      position: { x: 250, y },
    });
    edges.push({ id: `e${edges.length + 1}`, source: lastId, target: escId });
  }

  return assignIds({
    name: "Generated Workflow",
    description,
    nodes,
    edges,
  });
}

export async function parseNaturalLanguage(description: string): Promise<Workflow> {
  if (!openai || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    return keywordParse(description);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PARSE_SYSTEM_PROMPT },
        { role: "user", content: description },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    const validated = WorkflowSchema.parse(parsed);
    return assignIds(validated);
  } catch {
    return keywordParse(description);
  }
}

export async function generateDocumentation(workflow: Workflow): Promise<string> {
  if (!openai || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    return buildFallbackDocs(workflow);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Write clear technical documentation in Markdown for the given workflow JSON. Include: Overview, Process Flow, Node Reference, Error Handling.",
        },
        { role: "user", content: JSON.stringify(workflow, null, 2) },
      ],
      temperature: 0.4,
    });
    return response.choices[0]?.message?.content ?? buildFallbackDocs(workflow);
  } catch {
    return buildFallbackDocs(workflow);
  }
}

export async function generateTests(workflow: Workflow): Promise<string> {
  if (!openai || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    return buildFallbackTests(workflow);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate Vitest unit tests for the workflow. Test validation, condition evaluation, and simulation. Return ONLY test code.",
        },
        { role: "user", content: JSON.stringify(workflow, null, 2) },
      ],
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content ?? buildFallbackTests(workflow);
  } catch {
    return buildFallbackTests(workflow);
  }
}

function buildFallbackDocs(workflow: Workflow): string {
  const nodeList = workflow.nodes
    .map((n) => `- **${n.label}** (\`${n.type}\`) — ${JSON.stringify(n.config)}`)
    .join("\n");

  return `# ${workflow.name}

## Overview
${workflow.description || "Auto-generated workflow documentation."}

## Process Flow
${workflow.nodes.map((n, i) => `${i + 1}. ${n.label} (${n.type})`).join("\n")}

## Node Reference
${nodeList}

## Error Handling
- Disconnected nodes are flagged during validation
- Missing trigger node prevents simulation
- AI classification falls back to keyword matching when API unavailable
`;
}

function buildFallbackTests(workflow: Workflow): string {
  return `import { describe, it, expect } from "vitest";
import { validateWorkflow, simulateWorkflow } from "../services/engine";
import { EXAMPLE_INPUT } from "../schema/workflow";

const workflow = ${JSON.stringify(workflow, null, 2)};

describe("${workflow.name}", () => {
  it("passes validation", () => {
    expect(validateWorkflow(workflow)).toHaveLength(0);
  });

  it("simulates successfully", () => {
    const result = simulateWorkflow("${uuidv4()}", workflow, EXAMPLE_INPUT);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(["completed", "escalated"]).toContain(result.status);
  });
});
`;
}
