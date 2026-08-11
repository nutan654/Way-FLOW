import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import aiRoutes from "./routes/ai.js";
import simulationRoutes from "./routes/simulation.js";
import workflowRoutes from "./routes/workflows.js";
import analyticsRoutes from "./routes/analytics.js";
import shareRoutes from "./routes/share.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "wayflow-api" });
});

app.use("/api/workflows", workflowRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/simulation", simulationRoutes);

// On Vercel the built client is served by Vercel's static hosting itself
// (see vercel.json), not by this Express app running as a serverless function.
const serveClient =
  !process.env.VERCEL &&
  (process.env.SERVE_STATIC === "true" || process.env.NODE_ENV === "production");

if (serveClient) {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

export default app;
