# Way-FLOW

An AI-powered workflow studio that converts natural-language business processes into editable, executable, and testable workflow graphs.

Way-FLOW bridges the gap between no-code automation and traditional development. A user describes a business process in plain English, the system converts it into a structured workflow graph, provides a visual editor for modification, simulates execution against sample data, and generates documentation and tests from the resulting workflow.

## Overview

Way-FLOW is a full-stack workflow platform built around a typed workflow DSL.

The system combines:

* Natural-language workflow generation
* Interactive graph editing
* Deterministic workflow simulation
* Structural validation
* AI-assisted documentation generation
* Automatic test generation
* Persistent workflow storage
* Shareable read-only workflows
* Local fallback execution without an AI API key

The architecture separates the visual editor, API layer, persistence, AI integration, and workflow execution engine.

## Key Engineering Features

* Natural language → structured workflow graph
* Drag-and-drop workflow editor using React Flow
* Typed workflow DSL based on nodes and directed edges
* Deterministic in-process workflow simulation
* Conditional branching and shared execution context
* Pre-execution graph validation
* AI-powered workflow parsing and content generation
* Local keyword-based fallback when OpenAI is unavailable
* Automatic Markdown documentation generation
* Automatic Vitest test generation
* PostgreSQL persistence through Prisma ORM
* SQLite support for lightweight local development
* Zod-based request and workflow validation
* Shareable read-only workflow URLs
* End-to-end browser testing with Playwright
* Production deployment configuration for Vercel and Render

## System Architecture

```text
                         ┌─────────────────────────┐
                         │      React Frontend     │
                         │                         │
                         │  Create                 │
                         │  Editor                 │
                         │  Simulate               │
                         │  Export                 │
                         └────────────┬────────────┘
                                      │
                                  REST API
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   Express / TypeScript  │
                         │                         │
                         │  Validation             │
                         │  Workflow API           │
                         │  AI Integration         │
                         └──────┬────────┬─────────┘
                                │        │
                     ┌──────────┘        └─────────────┐
                     ▼                                 ▼
              ┌──────────────┐                ┌────────────────┐
              │   Prisma     │                │ Workflow Engine│
              │    ORM       │                │                │
              └──────┬───────┘                │ Graph Traversal│
                     │                        │ Conditions     │
                     ▼                        │ Context        │
              ┌──────────────┐                │ Simulation     │
              │ PostgreSQL   │                └────────────────┘
              │              │
              │ Workflows    │
              │ Nodes        │
              │ Edges        │
              └──────────────┘

                         ┌─────────────────────────┐
                         │       OpenAI API        │
                         │   Optional AI Layer     │
                         └─────────────────────────┘
```

## Workflow Model

Every workflow is represented as a directed graph.

A workflow consists of:

```text
Workflow
 ├── Nodes
 │    ├── trigger
 │    ├── ai_classify
 │    ├── condition
 │    ├── action
 │    ├── delay
 │    └── escalate
 │
 └── Edges
      ├── source
      ├── target
      └── optional branch label
```

This representation provides a common format for:

* Visual editing
* Validation
* Simulation
* Persistence
* Documentation generation
* Test generation

The graph is therefore the single source of truth across the application.

## Natural Language → Workflow

A user can describe a process such as:

```text
When a support ticket arrives, classify its urgency,
notify Slack if it is high priority, automatically reply
with an FAQ if it is low priority, and escalate to a
senior agent if there is no response within two hours.
```

Way-FLOW transforms the description into a structured graph containing typed nodes, connections, conditions, and execution metadata.

The resulting workflow can then be inspected and modified visually before execution.

## Workflow Editor

The frontend uses React Flow to provide an interactive graph editor.

Users can:

* Add workflow steps
* Connect nodes
* Reconfigure branches
* Move nodes
* Inspect workflow structure
* Zoom and pan across large graphs
* Edit workflow metadata

The UI operates on the same typed workflow representation consumed by the backend.

## Workflow Simulation Engine

The simulation engine executes workflows entirely in-process.

```text
Trigger
   │
   ▼
Update Context
   │
   ▼
Execute Node
   │
   ▼
Evaluate Condition
   │
   ├───────────────┐
   │               │
   ▼               ▼
Branch A        Branch B
   │               │
   └───────┬───────┘
           ▼
      Continue Graph
           │
           ▼
      Execution Trace
```

The engine:

1. Locates the trigger node.
2. Initializes a shared execution context.
3. Traverses the directed graph.
4. Executes each node deterministically.
5. Evaluates conditional branches.
6. Updates execution context.
7. Records each executed step.
8. Produces a complete execution trace.

Simulation intentionally avoids external API calls. AI-classification nodes use local keyword matching during simulation, making runs:

* Fast
* Deterministic
* Free
* Repeatable
* Suitable for automated testing

## Validation

Workflows are validated before execution.

The validation layer detects structural problems such as:

* Missing trigger nodes
* Disconnected nodes
* Invalid edges
* Broken workflow structure
* Invalid node configuration
* Unsupported node relationships

Runtime API input is additionally validated using Zod schemas.

This creates two levels of correctness:

```text
API Input Validation
        ↓
Workflow Graph Validation
        ↓
Simulation
```

## AI Integration

OpenAI is an optional intelligence layer used for:

* Natural-language workflow parsing
* Documentation generation
* Test generation

The system does not require an API key to function.

When `OPENAI_API_KEY` is unavailable, Way-FLOW falls back to a local keyword-based parser for workflow generation and local deterministic logic for simulation.

This makes the application usable in development, testing, and demonstration environments without external AI dependencies.

## Automatic Documentation

A workflow graph can be converted into readable Markdown documentation.

The generated documentation describes:

* Workflow purpose
* Trigger conditions
* Processing steps
* Branching logic
* Actions
* Escalation paths

This keeps documentation synchronized with the actual workflow structure rather than relying on manually maintained descriptions.

## Automatic Test Generation

Way-FLOW can generate runnable Vitest tests directly from a workflow graph.

This creates a development loop where:

```text
Natural Language
       ↓
Workflow Graph
       ↓
Simulation
       ↓
Generated Documentation
       ↓
Generated Tests
```

The workflow therefore becomes both an executable artifact and a source for its own documentation and test cases.

## Persistence

Workflow data is persisted through Prisma ORM.

The primary production database is PostgreSQL.

For lightweight local development, SQLite can be used without requiring a separate database server.

The persistence layer stores workflow definitions and their graph structure while keeping the domain model independent of the frontend representation.

## Technology Stack

| Layer            | Technology                   |
| ---------------- | ----------------------------- |
| Frontend         | React 19, TypeScript, Vite   |
| Styling          | Tailwind CSS                 |
| Workflow Editor  | React Flow (`@xyflow/react`) |
| State Management | Zustand                      |
| Routing          | React Router                 |
| Backend          | Node.js, Express, TypeScript |
| ORM              | Prisma                       |
| Database         | PostgreSQL                   |
| Local Database   | SQLite                       |
| Validation       | Zod                          |
| AI               | OpenAI API                   |
| Unit Testing     | Vitest                       |
| E2E Testing      | Playwright                   |
| Deployment       | Vercel + Render              |

These technologies match the current repository implementation.

## Project Structure

```text
Way-FLOW/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Create/
│   │   │   ├── Editor/
│   │   │   ├── Simulate/
│   │   │   └── Export/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── api/
│   │   └── types/
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── engine/
│   │   ├── validation/
│   │   └── ...
│   └── prisma/
│
├── api/
├── docs/
├── e2e/
├── package.json
├── playwright.config.ts
├── render.yaml
└── vercel.json
```

The repository currently separates the frontend and backend into `client/` and `server/`, with dedicated API, documentation, and end-to-end testing infrastructure.

## Local Development

### Requirements

* Node.js 20+
* npm 10+

Clone the repository:

```bash
git clone https://github.com/nutan654/Way-FLOW.git
cd Way-FLOW
```

Install dependencies:

```bash
npm install
```

Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Initialize the database:

```bash
npm run db:push
```

Start the frontend and backend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

and communicates with the Express API running on port `3001`.

The application works without an OpenAI API key through its local fallback implementation.

## Environment Variables

### Server

```text
DATABASE_URL
OPENAI_API_KEY
```

### Client

```text
VITE_API_URL
VITE_GITHUB_REPO_URL
```

`OPENAI_API_KEY` is optional because the application provides a local fallback parser.

## Testing

Unit tests use Vitest:

```bash
npm test
```

End-to-end tests use Playwright:

```bash
npx playwright test
```

The test architecture covers both application logic and browser-level workflows.

## Deployment

The repository contains deployment configuration for:

```text
Frontend  → Vercel
Backend   → Render
Database  → PostgreSQL
```

Deployment configuration is maintained through:

```text
render.yaml
vercel.json
```

The production architecture keeps the frontend and API independently deployable.

## Engineering Decisions

### Graph as the Core Domain Model

The workflow graph is the central representation used across editing, execution, validation, persistence, documentation, and testing.

This avoids maintaining separate representations of the same workflow in different application layers.

### Deterministic Simulation

Simulation does not make external network calls.

This makes workflow execution predictable and allows the same workflow to be tested repeatedly with identical input.

### AI as an Optional Layer

AI enhances workflow generation and developer productivity but is not required for the core application to function.

This prevents the entire system from becoming dependent on an external model provider.

### Typed Full-Stack Architecture

TypeScript is used across the frontend and backend, while Zod provides runtime validation at API boundaries.

This reduces mismatches between client payloads, server expectations, and workflow data structures.

## Future Improvements

Potential next steps include:

* Background workflow execution
* Persistent execution history
* Real external action integrations
* Webhook-triggered workflows
* Additional AI providers
* Workflow versioning
* Collaborative workflow editing
* Fine-grained execution permissions
* Production-grade job queues
* Workflow scheduling

## Author

**Nutan Bisandre**



[GitHub](https://github.com/nutan654)
