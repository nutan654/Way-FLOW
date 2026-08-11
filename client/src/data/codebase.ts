export interface CodeFile {
  path: string;
  name: string;
  summary: string;
  details: string;
  tags?: string[];
}

export interface CodeFolder {
  name: string;
  description: string;
  files: CodeFile[];
}

export const CODEBASE_SECTIONS: CodeFolder[] = [
  {
    name: "Root",
    description: "Monorepo config, scripts, and top-level docs.",
    files: [
      {
        path: "package.json",
        name: "package.json",
        summary: "Workspace root — runs client and server together.",
        details:
          "Defines npm workspaces for client/ and server/. Scripts: dev (both servers), build, test, db:push.",
        tags: ["config"],
      },
      {
        path: "README.md",
        name: "README.md",
        summary: "Project overview, setup, and API reference.",
        details: "Quick start guide, tech stack table, environment variables, and folder structure.",
        tags: ["docs"],
      },
      {
        path: "playwright.config.ts",
        name: "playwright.config.ts",
        summary: "End-to-end test configuration.",
        details: "Configures Playwright for browser tests in the e2e/ folder.",
        tags: ["test"],
      },
    ],
  },
  {
    name: "client/",
    description: "React frontend — the Wayflow UI you interact with.",
    files: [
      {
        path: "client/index.html",
        name: "index.html",
        summary: "HTML shell and font loading.",
        details: "Vite entry point. Loads Syne, DM Sans, and IBM Plex Mono fonts.",
        tags: ["frontend"],
      },
      {
        path: "client/vite.config.ts",
        name: "vite.config.ts",
        summary: "Vite dev server and API proxy.",
        details: "Runs on :5173. Proxies /api requests to the Express backend on :3001.",
        tags: ["config"],
      },
      {
        path: "client/src/main.tsx",
        name: "main.tsx",
        summary: "React app bootstrap.",
        details: "Mounts the root component and imports global styles.",
        tags: ["frontend"],
      },
      {
        path: "client/src/App.tsx",
        name: "App.tsx",
        summary: "Route definitions.",
        details: "React Router: Home, Create, Templates, Editor, Simulate, Export, Analytics, Source, and public ShareView.",
        tags: ["frontend"],
      },
      {
        path: "client/src/index.css",
        name: "index.css",
        summary: "Design system and global styles.",
        details:
          "Tailwind theme (cool cyan/navy palette), grain texture, buttons, inputs, cards, and React Flow overrides.",
        tags: ["frontend", "design"],
      },
      {
        path: "client/src/components/Layout.tsx",
        name: "Layout.tsx",
        summary: "App shell with sidebar navigation.",
        details: "Numbered journey nav (Describe → Ship), mobile bottom bar, and page outlet.",
        tags: ["frontend"],
      },
      {
        path: "client/src/pages/Home.tsx",
        name: "Home.tsx",
        summary: "Landing page with hero and feature overview.",
        details: "Asymmetric hero, animated path illustration, example template card, and step bento grid.",
        tags: ["frontend"],
      },
      {
        path: "client/src/pages/Create.tsx",
        name: "Create.tsx",
        summary: "Natural language workflow input.",
        details: "Textarea for process description → calls /api/ai/parse → saves workflow → opens Editor.",
        tags: ["frontend"],
      },
      {
        path: "client/src/pages/Editor.tsx",
        name: "Editor.tsx",
        summary: "Visual workflow canvas editor.",
        details: "Loads saved workflow, React Flow canvas, save/share/simulate actions.",
        tags: ["frontend"],
      },
      {
        path: "client/src/pages/Simulate.tsx",
        name: "Simulate.tsx",
        summary: "Workflow simulation runner.",
        details: "JSON test input; uses recorded runs when workflow has an ID (feeds Analytics).",
        tags: ["frontend"],
      },
      {
        path: "client/src/pages/Export.tsx",
        name: "Export.tsx",
        summary: "Docs, tests, and JSON export.",
        details: "Generates markdown docs and Vitest code via AI. Downloads workflow JSON.",
        tags: ["frontend"],
      },
      {
        path: "client/src/components/canvas/WorkflowCanvas.tsx",
        name: "WorkflowCanvas.tsx",
        summary: "React Flow canvas wrapper.",
        details: "Converts workflow DSL to nodes/edges, handles drag-and-drop and connections.",
        tags: ["frontend"],
      },
      {
        path: "client/src/components/nodes/WorkflowNodeComponent.tsx",
        name: "WorkflowNodeComponent.tsx",
        summary: "Custom node renderer for the canvas.",
        details: "Styled node cards with type color, label, and connection handles.",
        tags: ["frontend"],
      },
      {
        path: "client/src/components/simulation/SimulationPanel.tsx",
        name: "SimulationPanel.tsx",
        summary: "Step-by-step execution timeline UI.",
        details: "Shows status, each node walked, outputs, and final result.",
        tags: ["frontend"],
      },
      {
        path: "client/src/stores/workflowStore.ts",
        name: "workflowStore.ts",
        summary: "Global Zustand state.",
        details: "Shared workflow, simulation result, docs, tests, loading, and error across pages.",
        tags: ["frontend", "state"],
      },
      {
        path: "client/src/api/client.ts",
        name: "client.ts",
        summary: "Typed API client for the backend.",
        details: "Fetch wrappers for workflows, share links, templates, analytics, AI, and simulation.",
        tags: ["frontend", "api"],
      },
      {
        path: "client/src/types/workflow.ts",
        name: "workflow.ts",
        summary: "Frontend workflow types and constants.",
        details: "NodeType, Workflow, SimulationResult, NODE_COLORS, example prompt/input.",
        tags: ["frontend", "types"],
      },
    ],
  },
  {
    name: "server/",
    description: "Express API, AI service, simulation engine, and database.",
    files: [
      {
        path: "server/src/index.ts",
        name: "index.ts",
        summary: "Server entry point.",
        details: "Starts Express on PORT (default 3001).",
        tags: ["backend"],
      },
      {
        path: "server/src/app.ts",
        name: "app.ts",
        summary: "Express app setup.",
        details: "CORS, JSON middleware, /api/health, and route mounting.",
        tags: ["backend"],
      },
      {
        path: "server/src/routes/workflows.ts",
        name: "workflows.ts",
        summary: "CRUD routes for workflows.",
        details: "GET list, POST create, PUT update. Persists via Prisma.",
        tags: ["backend", "api"],
      },
      {
        path: "server/src/routes/ai.ts",
        name: "ai.ts",
        summary: "AI generation endpoints.",
        details: "POST /parse, /document, /tests — delegates to aiService with fallbacks.",
        tags: ["backend", "api", "ai"],
      },
      {
        path: "server/src/routes/simulation.ts",
        name: "simulation.ts",
        summary: "Simulation endpoints.",
        details: "POST /run executes workflow. POST /validate checks DSL rules.",
        tags: ["backend", "api"],
      },
      {
        path: "server/src/services/aiService.ts",
        name: "aiService.ts",
        summary: "OpenAI integration + fallbacks.",
        details:
          "Uses gpt-4o-mini for parse/docs/tests. Falls back to keyword parser and templates without API key.",
        tags: ["backend", "ai"],
      },
      {
        path: "server/src/services/engine.ts",
        name: "engine.ts",
        summary: "Deterministic workflow simulation engine.",
        details:
          "Walks the graph node by node, evaluates conditions, records steps. No external calls during sim.",
        tags: ["backend", "core"],
      },
      {
        path: "server/src/schema/workflow.ts",
        name: "workflow.ts",
        summary: "Workflow DSL schema (Zod).",
        details: "Validates node types, edges, and structure. Shared contract between AI and engine.",
        tags: ["backend", "types"],
      },
      {
        path: "server/prisma/schema.prisma",
        name: "schema.prisma",
        summary: "Database schema.",
        details: "Workflow and SimulationRun models. SQLite by default.",
        tags: ["backend", "database"],
      },
      {
        path: "server/.env.example",
        name: ".env.example",
        summary: "Environment variable template.",
        details: "DATABASE_URL, PORT, OPENAI_API_KEY, CLIENT_URL.",
        tags: ["config"],
      },
    ],
  },
  {
    name: "docs/",
    description: "Technical documentation for the project.",
    files: [
      {
        path: "docs/ARCHITECTURE.md",
        name: "ARCHITECTURE.md",
        summary: "System design and data flow.",
        details: "Monorepo diagram, Workflow DSL, AI pipeline, simulation engine, and design decisions.",
        tags: ["docs"],
      },
      {
        path: "docs/API.md",
        name: "API.md",
        summary: "REST API reference.",
        details: "All endpoints with request/response examples.",
        tags: ["docs"],
      },
      {
        path: "docs/AI-PROMPTS.md",
        name: "AI-PROMPTS.md",
        summary: "AI prompt documentation.",
        details: "System prompts for parse, document, and test generation. Model and fallback behavior.",
        tags: ["docs", "ai"],
      },
    ],
  },
  {
    name: "tests/",
    description: "Unit and end-to-end tests.",
    files: [
      {
        path: "server/src/services/engine.test.ts",
        name: "engine.test.ts",
        summary: "Simulation engine unit tests.",
        details: "Tests node execution, branching, and edge cases in the workflow engine.",
        tags: ["test"],
      },
      {
        path: "server/src/routes/api.test.ts",
        name: "api.test.ts",
        summary: "API route integration tests.",
        details: "Supertest tests for health, workflows, and simulation endpoints.",
        tags: ["test"],
      },
      {
        path: "e2e/create-workflow.spec.ts",
        name: "create-workflow.spec.ts",
        summary: "Playwright end-to-end test.",
        details: "Browser test for the create → editor workflow flow.",
        tags: ["test", "e2e"],
      },
    ],
  },
];

export const ALL_FILES = CODEBASE_SECTIONS.flatMap((s) => s.files);
