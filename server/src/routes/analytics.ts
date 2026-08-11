import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { WORKFLOW_TEMPLATES } from "../data/templates.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/templates", (_req, res) => {
  res.json(
    WORKFLOW_TEMPLATES.map(({ id, name, description, category, icon, accent }) => ({
      id,
      name,
      description,
      category,
      icon,
      accent,
    })),
  );
});

router.get("/templates/:id", (req, res) => {
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: "Template not found" });
  res.json(template);
});

router.get("/", async (_req, res) => {
  const [workflowCount, runCount, runs, workflows] = await Promise.all([
    prisma.workflow.count(),
    prisma.simulationRun.count(),
    prisma.simulationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { workflow: { select: { id: true, name: true } } },
    }),
    prisma.workflow.findMany({ include: { runs: true } }),
  ]);

  const statusCounts = { completed: 0, failed: 0, escalated: 0 };
  const allRunsForStatus = await prisma.simulationRun.findMany({ select: { status: true } });
  for (const run of allRunsForStatus) {
    const s = run.status as keyof typeof statusCounts;
    if (s in statusCounts) statusCounts[s]++;
  }

  const allRuns = await prisma.simulationRun.findMany({
    select: { status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const runsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    runsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const run of allRuns) {
    const day = run.createdAt.toISOString().slice(0, 10);
    if (day in runsByDay) runsByDay[day]++;
  }

  const nodeTypeCounts: Record<string, number> = {};
  for (const wf of workflows) {
    const nodes = JSON.parse(wf.nodes) as { type: string }[];
    for (const node of nodes) {
      nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] ?? 0) + 1;
    }
  }

  const topWorkflows = workflows
    .map((wf) => ({
      id: wf.id,
      name: wf.name,
      runCount: wf.runs.length,
      lastRun: wf.runs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt ?? null,
    }))
    .sort((a, b) => b.runCount - a.runCount)
    .slice(0, 5);

  const sharedCount = workflows.filter((w) => w.shareToken).length;

  const successRate =
    runCount > 0 ? Math.round((statusCounts.completed / runCount) * 100) : 0;

  res.json({
    workflowCount,
    runCount,
    sharedCount,
    successRate,
    statusCounts,
    runsByDay: Object.entries(runsByDay).map(([date, count]) => ({ date, count })),
    nodeTypeCounts,
    topWorkflows,
    recentRuns: runs.map((r) => ({
      id: r.id,
      workflowId: r.workflowId,
      workflowName: r.workflow.name,
      status: r.status,
      stepCount: JSON.parse(r.steps).length,
      createdAt: r.createdAt,
    })),
  });
});

export default router;
