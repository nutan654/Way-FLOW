// Vercel serverless entry point. Vercel maps this file (api/index.ts) to the
// route "/api", and vercel.json rewrites all "/api/*" requests here while
// preserving the original path, so the Express app's own routing
// (app.use("/api/workflows", ...), etc.) still works unchanged.
//
// This imports the *compiled* server build (server/dist), produced by the
// root "build" script, rather than the TypeScript source directly, so there
// is no ambiguity in how Vercel's function bundler resolves the import.
import "dotenv/config";
import app from "../server/dist/app.js";

export default app;
