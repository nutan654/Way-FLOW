import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

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

router.get("/:token", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({
    where: { shareToken: req.params.token },
  });
  if (!workflow) return res.status(404).json({ error: "Shared workflow not found" });
  res.json(serializeWorkflow(workflow));
});

export default router;
