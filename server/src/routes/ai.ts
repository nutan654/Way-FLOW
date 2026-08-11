import { Router } from "express";
import {
  generateDocumentation,
  generateTests,
  parseNaturalLanguage,
} from "../services/aiService.js";

const router = Router();

router.post("/parse", async (req, res) => {
  const { description } = req.body;
  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "description is required" });
  }

  try {
    const workflow = await parseNaturalLanguage(description);
    res.json(workflow);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "AI parse failed" });
  }
});

router.post("/document", async (req, res) => {
  const { workflow } = req.body;
  if (!workflow) return res.status(400).json({ error: "workflow is required" });

  try {
    const markdown = await generateDocumentation(workflow);
    res.json({ markdown });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Doc generation failed" });
  }
});

router.post("/tests", async (req, res) => {
  const { workflow } = req.body;
  if (!workflow) return res.status(400).json({ error: "workflow is required" });

  try {
    const code = await generateTests(workflow);
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Test generation failed" });
  }
});

export default router;
