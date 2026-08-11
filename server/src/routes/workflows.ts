import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { WorkflowSchema } from "../schema/workflow.js";
const router = Router();
const prisma = new PrismaClient();

function serializeWorkflow(record: {
  id: string;
  name: string;
  description: string;
  nodes: string;
  edges: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    nodes: JSON.parse(record.nodes),
    edges: JSON.parse(record.edges),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

router.get("/", async (_req, res) => {
  const workflows = await prisma.workflow.findMany({ orderBy: { updatedAt: "desc" } });
  res.json(workflows.map(serializeWorkflow));
});

router.get("/:id", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!workflow) return res.status(404).json({ error: "Workflow not found" });
  res.json(serializeWorkflow(workflow));
});

router.post("/", async (req, res) => {
  try {
    const parsed = WorkflowSchema.parse(req.body);
    const created = await prisma.workflow.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        nodes: JSON.stringify(parsed.nodes),
        edges: JSON.stringify(parsed.edges),
      },
    });
    res.status(201).json(serializeWorkflow(created));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid workflow" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const parsed = WorkflowSchema.parse(req.body);
    const updated = await prisma.workflow.update({
      where: { id: req.params.id },
      data: {
        name: parsed.name,
        description: parsed.description,
        nodes: JSON.stringify(parsed.nodes),
        edges: JSON.stringify(parsed.edges),
      },
    });
    res.json(serializeWorkflow(updated));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  await prisma.workflow.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.post("/:id/share", async (req, res) => {
  const existing = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Workflow not found" });

  const shareToken = existing.shareToken ?? uuidv4().slice(0, 12);
  if (!existing.shareToken) {
    await prisma.workflow.update({
      where: { id: req.params.id },
      data: { shareToken },
    });
  }

  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
  res.json({ shareToken, shareUrl: `${clientUrl}/share/${shareToken}` });
});

router.delete("/:id/share", async (req, res) => {
  try {
    await prisma.workflow.update({
      where: { id: req.params.id },
      data: { shareToken: null },
    });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Workflow not found" });
  }
});

export default router;