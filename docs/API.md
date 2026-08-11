# API Reference

Base URL: `http://localhost:3001/api` (development)

## Health

### `GET /health`

Returns API status.

**Response:**
```json
{ "status": "ok", "service": "wayflow-api" }
```

---

## Workflows

### `GET /workflows`

List all workflows, newest first.

### `GET /workflows/:id`

Get a single workflow by ID.

**Errors:** `404` if not found.

### `POST /workflows`

Create a workflow.

**Body:**
```json
{
  "name": "Support Ticket Triage",
  "description": "Auto-classify and route tickets",
  "nodes": [...],
  "edges": [...]
}
```

**Response:** `201` with created workflow (includes `id`, `createdAt`, `updatedAt`).

### `PUT /workflows/:id`

Update an existing workflow. Same body shape as create.

### `DELETE /workflows/:id`

Delete a workflow. **Response:** `204`.

---

## AI

### `POST /ai/parse`

Convert natural language into a workflow JSON.

**Body:**
```json
{ "description": "When a support ticket arrives..." }
```

**Response:** Workflow object (`name`, `description`, `nodes`, `edges`).

### `POST /ai/document`

Generate markdown documentation for a workflow.

**Body:**
```json
{ "workflow": { "name": "...", "nodes": [...], "edges": [...] } }
```

**Response:**
```json
{ "markdown": "# Support Ticket Triage\n\n..." }
```

### `POST /ai/tests`

Generate Vitest test code for a workflow.

**Body:**
```json
{ "workflow": { "name": "...", "nodes": [...], "edges": [...] } }
```

**Response:**
```json
{ "code": "import { describe, it, expect } from \"vitest\";\n..." }
```

---

## Simulation

### `POST /simulation/validate`

Validate a workflow structure.

**Body:** Full workflow object.

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

### `POST /simulation/run`

Simulate a workflow without saving (preview mode).

**Body:**
```json
{
  "workflow": { "name": "...", "nodes": [...], "edges": [...] },
  "input": { "ticketId": "TKT-1042", "message": "..." }
}
```

**Response:**
```json
{
  "workflowId": "preview",
  "input": { ... },
  "steps": [
    {
      "nodeId": "n1",
      "nodeLabel": "New Ticket",
      "nodeType": "trigger",
      "action": "Triggered by: ticket.created",
      "output": { ... },
      "timestamp": 1234567890
    }
  ],
  "status": "escalated",
  "finalOutput": { ... }
}
```

### `POST /simulation/run/:id`

Run simulation for a persisted workflow. Persists result to `SimulationRun`.

### `GET /simulation/history/:workflowId`

Get last 20 simulation runs for a workflow.

---

## Error Responses

All errors return:
```json
{ "error": "Human-readable message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Invalid request body or workflow |
| `404` | Resource not found |
| `500` | Server or AI processing error |
