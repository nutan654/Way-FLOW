import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { EXAMPLE_WORKFLOW } from "../schema/workflow.js";

describe("API routes", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/ai/parse returns a workflow", async () => {
    const res = await request(app)
      .post("/api/ai/parse")
      .send({ description: "Classify support tickets by urgency and escalate after 2 hours" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBeDefined();
    expect(res.body.nodes.length).toBeGreaterThan(0);
    expect(res.body.nodes[0].type).toBe("trigger");
  });

  it("POST /api/simulation/validate accepts valid workflow", async () => {
    const res = await request(app).post("/api/simulation/validate").send(EXAMPLE_WORKFLOW);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.errors).toHaveLength(0);
  });

  it("POST /api/simulation/run executes workflow", async () => {
    const res = await request(app)
      .post("/api/simulation/run")
      .send({
        workflow: EXAMPLE_WORKFLOW,
        input: { message: "This is urgent!" },
      });
    expect(res.status).toBe(200);
    expect(res.body.steps.length).toBeGreaterThan(0);
    expect(["completed", "escalated"]).toContain(res.body.status);
  });
});
