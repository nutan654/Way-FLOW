import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { EXAMPLE_INPUT, WorkflowSchema } from "../schema/workflow.js";
import { simulateWorkflow, validateWorkflow } from "../services/engine.js";

const router = Router();
const prisma = new PrismaClient();

router.post("/validate", (req, res) => {
  try {
    const workflow = WorkflowSchema.parse(req.body);
    const errors = validateWorkflow(workflow);
    res.json({ valid: errors.length === 0, errors });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid workflow" });
  }
});

router.post("/run/:id", async (req, res) => {
  const record = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!record) return res.status(404).json({ error: "Workflow not found" });

  const workflow = WorkflowSchema.parse({
    name: record.name,
    description: record.description,
    nodes: JSON.parse(record.nodes),
    edges: JSON.parse(record.edges),
  });

  const input = req.body.input ?? EXAMPLE_INPUT;

  try {
    const result = simulateWorkflow(record.id, workflow, input);
    await prisma.simulationRun.create({
      data: {
        workflowId: record.id,
        input: JSON.stringify(input),
        steps: JSON.stringify(result.steps),
        status: result.status,
      },
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Simulation failed" });
  }
});

router.post("/run", (req, res) => {
  try {
    const { workflow, input } = req.body;
    const parsed = WorkflowSchema.parse(workflow);
    const result = simulateWorkflow("preview", parsed, input ?? EXAMPLE_INPUT);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Simulation failed" });
  }
});

router.get("/history/:workflowId", async (req, res) => {
  const runs = await prisma.simulationRun.findMany({
    where: { workflowId: req.params.workflowId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json(
    runs.map((r) => ({
      id: r.id,
      input: JSON.parse(r.input),
      steps: JSON.parse(r.steps),
      status: r.status,
      createdAt: r.createdAt,
    })),
  );
});

export default router;
