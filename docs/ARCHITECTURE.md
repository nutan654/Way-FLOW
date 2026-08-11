# Architecture

## Overview

Wayflow is a monorepo with a React frontend and Node.js backend. The core concept is a **Workflow DSL** — a JSON schema that represents business processes as nodes and edges, which can be created by AI, edited visually, simulated, and exported.

## System Diagram

```
┌─────────────┐     REST API      ┌──────────────────┐
│  React UI   │ ◄──────────────► │  Express Server   │
│  (Vite)     │                   │  (TypeScript)    │
└─────────────┘                   └────────┬─────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          │              │              │
                    ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
                    │  Prisma   │  │ OpenAI  │  │ Workflow  │
                    │  SQLite   │  │   API   │  │  Engine   │
                    └───────────┘  └─────────┘  └───────────┘
```

## Workflow DSL

Every workflow is a directed graph:

- **Nodes** — typed steps (trigger, ai_classify, condition, action, delay, escalate)
- **Edges** — connections between nodes, optionally labeled for branching

Validation rules:
- Exactly one trigger node required
- All non-trigger nodes must be connected
- Edge source/target must reference existing nodes

## AI Pipeline

Three AI endpoints, each with a fallback when no API key is configured:

1. **Parse** — natural language → workflow JSON (OpenAI structured output or keyword parser)
2. **Document** — workflow JSON → markdown technical documentation
3. **Tests** — workflow JSON → Vitest unit test code

## Simulation Engine

Deterministic, in-process execution:

1. Start at trigger node
2. Execute each node, updating a shared context object
3. Follow edges based on node type (condition branches, AI classify labels)
4. Record each step with timestamp, action description, and output
5. Stop on escalate node or when no more nodes

No external services are called during simulation — AI classification uses keyword matching.

## Data Model

```
Workflow
├── id, name, description
├── nodes (JSON string)
├── edges (JSON string)
└── SimulationRun[]
    ├── input (JSON string)
    ├── steps (JSON string)
    └── status
```

## Frontend State

Zustand store holds the current workflow, simulation result, generated docs/tests, and loading/error state. Shared across Create → Editor → Simulate → Export pages.

## Key Design Decisions

- **SQLite over PostgreSQL** — zero-config local development; swap to PostgreSQL by changing the Prisma datasource
- **AI fallback parser** — app works fully without an OpenAI key for demos and testing
- **JSON columns in SQLite** — nodes/edges stored as JSON strings; parsed on read
- **Proxy in Vite** — `/api` proxied to backend during development
