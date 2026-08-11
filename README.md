# 🌊 Wayflow

**Turn a business process written in plain English into a visual, working workflow — automatically.**

Describe what should happen ("when a support ticket comes in, classify it, notify Slack if urgent..."), and Wayflow turns that into an editable flowchart, runs it against sample data step by step, and generates documentation and test code for it. No workflow-building experience needed.

---

## Table of contents

- [What is this, really?](#what-is-this-really)
- [Features](#features)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Getting started](#getting-started)
- [Trying it out](#trying-it-out)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [API reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## What is this, really?

If you're new to this project, here's the plain-English version:

Imagine you want to automate something like *"when a customer emails support, figure out how urgent it is, and either reply automatically or alert a human."* Normally you'd need a no-code automation tool, or you'd write custom code by hand.

Wayflow sits in between: you type the process out in a sentence or two, an AI model (or a simple built-in fallback that works with **no API key**) turns it into a structured flowchart, and then you can:

- **See it** as boxes and arrows on a canvas (drag things around, add steps)
- **Test it** by running fake data through it and watching each step execute
- **Get docs and tests for it**, automatically written from the flowchart

It's a small full-stack app — a React frontend, an Express/TypeScript API, and a database — built to demonstrate an AI-assisted product from end to end: parsing natural language, a visual editor, a simulation engine, and deployable infrastructure.

## Features

- 📝 **Natural language → workflow** — paste a process description, get a structured graph of nodes and edges
- 🖱️ **Visual drag-and-drop editor** — built on [React Flow](https://reactflow.dev/) (`@xyflow/react`)
- ▶️ **Step-by-step simulation** — run the workflow against sample input and inspect exactly what happened at each node
- ✅ **Validation** — catches disconnected nodes, missing triggers, and other structural problems before you run it
- 📄 **Auto-generated documentation** — turns a workflow graph into readable markdown docs
- 🧪 **Auto-generated tests** — turns a workflow graph into runnable Vitest test code
- 🔌 **Works without an API key** — a local keyword-based parser handles the AI features if you don't have an OpenAI key
- 🔗 **Shareable links** — generate a read-only link to a workflow

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Flow (`@xyflow/react`), Zustand, React Router |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL (SQLite for pure local dev, see below) |
| AI | OpenAI API — optional, with a local fallback parser |
| Testing | Vitest (unit), Playwright (end-to-end) |
| Validation | Zod |

## How it works

```
┌─────────────┐      REST API      ┌────────────────────┐
│  React UI   │ ◄────────────────► │   Express Server    │
│  (Vite)     │                    │   (TypeScript)       │
└─────────────┘                    └──────────┬──────────┘
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       │                       │                       │
                 ┌─────▼─────┐          ┌─────▼─────┐          ┌──────▼──────┐
                 │  Prisma    │          │  OpenAI    │          │  Workflow    │
                 │  ORM / DB  │          │  API       │          │  Engine      │
                 └────────────┘          └────────────┘          └──────────────┘
```

Every workflow is stored as a **directed graph** — a `Workflow DSL`:

- **Nodes** are typed steps: `trigger`, `ai_classify`, `condition`, `action`, `delay`, `escalate`
- **Edges** connect nodes, optionally labeled (for branching, e.g. "if urgent")

The **simulation engine** runs entirely in-process, deterministically: it starts at the trigger node, walks the graph updating a shared context object, follows conditional branches, and records each step. No external calls happen during simulation — even AI-classification steps use local keyword matching so runs are fast, free, and repeatable.

For a deeper dive, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Getting started

**Requirements:** [Node.js](https://nodejs.org) 20+ and npm 10+ (check with `node -v` and `npm -v`).

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/wayflow.git
cd wayflow

# 2. Install everything (frontend + backend, it's a single npm workspace)
npm install

# 3. Set up environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Create the local database
npm run db:push

# 5. Start both the API and the frontend, with hot reload
npm run dev
```

Open **http://localhost:5173** in your browser — the frontend talks to the API running on port `3001`.

That's it — the app works immediately with no OpenAI key. AI parsing, docs, and test generation will use a built-in local fallback instead of calling out to OpenAI.

### Optional: connect a real OpenAI key

For smarter parsing and generation, add a key to `server/.env`:

```
OPENAI_API_KEY=sk-...
```

### Optional: link your GitHub repo in the app UI

Once you've pushed this to your own GitHub, set this in `client/.env` so the in-app "View source" links point to your repo instead of the placeholder:

```
VITE_GITHUB_REPO_URL=https://github.com/YOUR_USERNAME/wayflow
```

## Trying it out

1. Go to **Create** → click **Use example** → **Generate Workflow**
2. Open **Editor** and explore the canvas — drag nodes, zoom, inspect connections
3. Go to **Simulate** → run it with the default sample ticket
4. Open **Export** → generate docs and tests → download the workflow as JSON

Example prompt (also built into the app as a one-click example):

> When a support ticket arrives, classify urgency with AI, notify Slack if high priority, auto-reply with FAQ if low priority, and escalate to a senior agent if no response within 2 hours.

## Project structure

```
wayflow/
├── client/                 React frontend
│   ├── src/
│   │   ├── pages/          Route-level views (Create, Editor, Simulate, Export...)
│   │   ├── components/     Reusable UI pieces
│   │   ├── stores/         Zustand state stores
│   │   ├── api/            Typed API client
│   │   └── types/          Shared TypeScript types
│   └── vite.config.ts
├── server/                 Express API
│   ├── src/
│   │   ├── routes/         Express route handlers (workflows, ai, simulation, analytics, share)
│   │   ├── services/       AI parsing/generation, simulation engine
│   │   └── schema/         Zod validation schemas
│   └── prisma/
│       └── schema.prisma   Database schema
├── api/                    Vercel serverless entry point (see Deployment)
├── docs/                   Architecture, API reference, AI prompt notes
├── e2e/                    Playwright end-to-end tests
├── render.yaml             Render.com one-click deploy config
└── vercel.json             Vercel deploy config
```

## Environment variables

**Server** (`server/.env`, copy from `server/.env.example`):

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Local dev uses SQLite. Production (Vercel full-stack) needs a real Postgres connection string — see [Deployment](#deployment). |
| `PORT` | `3001` | API port |
| `OPENAI_API_KEY` | — | Optional. Without it, AI features fall back to a local parser. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `SERVE_STATIC` | — | Set to `true` in production if this server should also serve the built frontend (not needed on Vercel) |

**Client** (`client/.env`, copy from `client/.env.example`):

| Variable | Notes |
|---|---|
| `VITE_GITHUB_REPO_URL` | Your public GitHub repo URL, shown in the app's sidebar and source links |
| `VITE_API_URL` | Only needed if the frontend is deployed separately from the API (e.g. frontend on Vercel, API on Render). Leave unset if they share an origin. |

## Available scripts

Run these from the repo root:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API and frontend together with hot reload |
| `npm run build` | Production build — generates the Prisma client, builds the server, builds the client |
| `npm run start` | Starts the built server (run `build` first) |
| `npm run start:prod` | Pushes the DB schema, then starts the built server |
| `npm test` | Runs backend unit tests (Vitest) |
| `npm run test:e2e` | Runs Playwright end-to-end tests |
| `npm run db:push` | Syncs the Prisma schema to your database |
| `npm run db:studio` | Opens Prisma Studio, a GUI for browsing your database |

## API reference

All routes are prefixed with `/api`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/workflows` | List all workflows |
| `GET` | `/api/workflows/:id` | Get one workflow |
| `POST` | `/api/workflows` | Create a workflow |
| `PUT` | `/api/workflows/:id` | Update a workflow |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |
| `POST` | `/api/workflows/:id/share` | Create a shareable read-only link |
| `GET` | `/api/share/:token` | Fetch a workflow via its share link |
| `POST` | `/api/ai/parse` | Natural language description → workflow graph |
| `POST` | `/api/ai/document` | Workflow graph → markdown documentation |
| `POST` | `/api/ai/tests` | Workflow graph → Vitest test code |
| `POST` | `/api/simulation/run` | Run a simulation against sample input |
| `POST` | `/api/simulation/validate` | Validate a workflow's graph structure |
| `GET` | `/api/analytics` | Aggregate usage stats across workflows |

Full request/response shapes and examples are in [`docs/API.md`](docs/API.md).

## Testing

```bash
npm test          # backend unit tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright) — starts the app and drives it in a real browser
```

## Deployment

Two ready-to-use paths are included.

### Option A — single service on Render (simplest)

[`render.yaml`](render.yaml) deploys one Node service that serves both the API and the built frontend, with a persistent SQLite database on disk.

1. Push this repo to GitHub.
2. In [Render](https://render.com), choose **New → Blueprint**, point it at your repo — it reads `render.yaml` automatically.
3. Set `CLIENT_URL` to your Render URL, and optionally `OPENAI_API_KEY`.
4. Deploy.

### Option B — frontend + API on Vercel (serverless)

[`vercel.json`](vercel.json) builds the client as a static site and deploys the Express API as a single serverless function at `api/index.ts`. Because serverless functions don't have a persistent filesystem, this path needs a **hosted Postgres database** rather than the local SQLite file — the Prisma schema is already set to `provider = "postgresql"`.

1. Get a free Postgres database from [Neon](https://neon.tech) or [Supabase](https://supabase.com), and copy its connection string.
2. Import the repo in [Vercel](https://vercel.com) — it detects `vercel.json` automatically.
3. In the Vercel project's **Environment Variables**, set:
   ```
   DATABASE_URL=<your Neon/Supabase connection string>
   OPENAI_API_KEY=<optional>
   ```
4. Push the schema to your new database once: `DATABASE_URL=<your string> npm run db:push -w server`
5. Deploy. Visit `/api/health` on your deployed URL to confirm the API is live.

## Contributing

Issues and pull requests are welcome. If you're picking this up as a learning project:

1. Fork the repo and create a branch for your change
2. Run `npm run dev` and confirm your change works locally
3. Run `npm test` before opening a PR
4. Open a PR describing what changed and why

## License

MIT — see [LICENSE](LICENSE).
