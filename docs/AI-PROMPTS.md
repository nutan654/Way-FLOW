# AI Prompt Design

Wayflow uses three AI prompts, each with a deterministic fallback.

## 1. Natural Language Parser

**Endpoint:** `POST /api/ai/parse`

**System prompt:**
```
You are a workflow architect. Convert business process descriptions into structured workflow JSON.

Rules:
- Use ONLY these node types: trigger, ai_classify, condition, action, delay, escalate
- Every workflow MUST start with exactly one trigger node
- Assign x,y positions spaced ~120px apart vertically
- Return valid JSON with: name, description, nodes[], edges[]
```

**Model:** `gpt-4o-mini` with `response_format: { type: "json_object" }`

**Fallback:** Keyword-based parser detects words like "classify", "slack", "escalate", "hour" and builds a workflow programmatically.

**Validation:** Output is parsed with Zod `WorkflowSchema` before returning.

## 2. Documentation Generator

**Endpoint:** `POST /api/ai/document`

**System prompt:**
```
Write clear technical documentation in Markdown for the given workflow JSON.
Include: Overview, Process Flow, Node Reference, Error Handling.
```

**Fallback:** Template-based markdown generation from workflow nodes.

## 3. Test Generator

**Endpoint:** `POST /api/ai/tests`

**System prompt:**
```
Generate Vitest unit tests for the workflow.
Test validation, condition evaluation, and simulation.
Return ONLY test code.
```

**Fallback:** Pre-built test template with workflow JSON embedded.

## Error Handling

- Invalid JSON from AI → fallback parser
- OpenAI API errors → fallback generators
- Missing API key → all fallbacks activate automatically
- Schema validation failures → 400 response with error message

## Configuration

Set `OPENAI_API_KEY` in `server/.env`. The app detects the placeholder value `your_openai_api_key_here` and uses fallbacks instead.
