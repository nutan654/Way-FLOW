import { describe, it, expect } from "vitest";
import { validateWorkflow, simulateWorkflow } from "./engine.js";
import { EXAMPLE_INPUT, EXAMPLE_WORKFLOW } from "../schema/workflow.js";

describe("validateWorkflow", () => {
  it("passes for a valid example workflow", () => {
    expect(validateWorkflow(EXAMPLE_WORKFLOW)).toHaveLength(0);
  });

  it("fails when trigger is missing", () => {
    const bad = {
      ...EXAMPLE_WORKFLOW,
      nodes: EXAMPLE_WORKFLOW.nodes.filter((n) => n.type !== "trigger"),
    };
    const errors = validateWorkflow(bad);
    expect(errors.some((e) => e.message.includes("trigger"))).toBe(true);
  });

  it("detects disconnected nodes", () => {
    const bad = {
      ...EXAMPLE_WORKFLOW,
      nodes: [
        ...EXAMPLE_WORKFLOW.nodes,
        {
          id: "orphan",
          type: "action" as const,
          label: "Orphan",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
    };
    const errors = validateWorkflow(bad);
    expect(errors.some((e) => e.message.includes("disconnected"))).toBe(true);
  });
});

describe("simulateWorkflow", () => {
  it("runs the support triage workflow", () => {
    const result = simulateWorkflow("test-id", EXAMPLE_WORKFLOW, EXAMPLE_INPUT);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].nodeType).toBe("trigger");
    expect(["completed", "escalated"]).toContain(result.status);
  });

  it("classifies urgent messages as high priority", () => {
    const result = simulateWorkflow("test-id", EXAMPLE_WORKFLOW, EXAMPLE_INPUT);
    const classifyStep = result.steps.find((s) => s.nodeType === "ai_classify");
    expect(classifyStep?.output?.urgency).toBe("high");
  });

  it("throws on invalid workflow", () => {
    const bad = {
      ...EXAMPLE_WORKFLOW,
      nodes: EXAMPLE_WORKFLOW.nodes.filter((n) => n.type !== "trigger"),
    };
    expect(() => simulateWorkflow("test-id", bad, EXAMPLE_INPUT)).toThrow();
  });
});
