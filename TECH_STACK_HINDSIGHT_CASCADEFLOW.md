# Technical Architecture: Vectorize Hindsight & CascadeFlow Integration

This document maps RecallOps platform capabilities, design patterns, and features directly to their corresponding backend and frontend implementation files.

---

## 🗺️ Feature-to-File Matrix

| Feature Domain | Primary Files | Key Functions / Symbols | Technical Responsibility |
| :--- | :--- | :--- | :--- |
| **Hindsight Client Factory** | [`src/config/hindsight.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/config/hindsight.js) | `createHindsightClient`, `isHindsightConfigured`, `hindsightClient` | Initializes official `@vectorize-io/hindsight-client` singleton with fallback detection for development. |
| **Hindsight Retain, Recall, Reflect** | [`src/services/hindsight.service.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/services/hindsight.service.js) | `retain()`, `recall()`, `reflect()` | Encapsulates semantic retention of incident postmortems, vector query recall, and multi-incident reflection synthesis. |
| **Honest Memory Proof** | [`src/services/analyze.service.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/services/analyze.service.js) | `_buildMemoryProof()`, `analyzeIssue()` | Generates transparent `memory_proof` audit payload (`hindsight` vs `local-fallback`, recall/reflection status, evidence count). |
| **CascadeFlow Agent Factory** | [`src/config/cascadeflow.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/config/cascadeflow.js) | `createCascadeAgent()`, `isCascadeflowConfigured()` | Builds `@cascadeflow/core` `CascadeAgent` configuring speculative cascade routing; **prefers Groq** when `GROQ_API_KEY` is provided. |
| **CascadeFlow Runtime Intelligence** | [`src/services/cascadeflow.service.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/services/cascadeflow.service.js) | `refineRemediation()` | Executes speculative cascade run or honest simulated audit trail with cost, latency, routing strategy, and draft acceptance tracking. |
| **Analysis Pipeline Orchestration** | [`src/services/analyze.service.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/services/analyze.service.js) | `analyzeIssue()`, `_rankIncidents()`, `_detectRecurringPattern()` | Coordinates Hindsight recall -> Bayesian fix ranking -> pattern detection -> risk prediction -> Hindsight reflect -> CascadeFlow refinement. |
| **Team Memory Wall Backend** | [`src/services/store.service.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/services/store.service.js)<br>[`src/controllers/store.controller.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/controllers/store.controller.js)<br>[`src/routes/store.routes.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/routes/store.routes.js) | `getMemories()`, `seedDefaultIncidents()`, `updateIncidentFeedback()` | Serves `GET /store/memory` returning retained memories sorted **newest-first** with worked/failed/pending verification counts and tags. |
| **Feedback Reinforcement Loop** | [`src/services/feedback.service.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/services/feedback.service.js)<br>[`src/controllers/feedback.controller.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/controllers/feedback.controller.js) | `recordFixFeedback()` | Retains verification feedback in Hindsight, updates incident memory counts, and triggers instant memory adaptation. |
| **Dual Technology UI & Chips** | [`public/index.html`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/public/index.html)<br>[`public/css/style.css`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/public/css/style.css)<br>[`public/js/app.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/public/js/app.js) | `renderDevOpsDashboard()`, `.tech-intelligence-bar`, `#chipHindsightProof`, `#chipCascadeflowProof` | Renders high-visibility proof chips for Hindsight live/fallback mode and CascadeFlow runtime latency, savings %, and model used. |
| **Team Memory Wall UI & Animation** | [`public/index.html`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/public/index.html)<br>[`public/css/style.css`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/public/css/style.css)<br>[`public/js/app.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/public/js/app.js) | `loadTeamMemoryWall()`, `renderMemoryWallCards()`, `.memory-card-highlighted` | Renders dynamic memory card grid, filter pills, and animates a glowing pulse highlight on the reinforced card upon feedback submission. |
| **Validation & Schema Guardrails** | [`src/routes/*.routes.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/routes/)<br>[`src/middlewares/validateRequest.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/src/middlewares/validateRequest.js) | Zod Schemas (`storeSchema`, `analyzeSchema`, `feedbackSchema`) | Strict schema validation ensuring type safety, sanitized inputs, and structured error responses. |
| **Automated Test Suite** | [`tests/api.test.js`](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/tests/api.test.js) | 25 Test Cases across 9 Suites | Full integration test coverage for `/health`, `/store`, `/store/memory`, `/analyze`, `/feedback`, Hindsight, and CascadeFlow. |

---

## 🧠 Technology 1: Vectorize Hindsight (`@vectorize-io/hindsight-client`)

### Retain Path (`POST /store` and `POST /feedback`)
1. Incident resolutions or verification outcomes are formatted with structured metadata (`issue`, `root_cause`, `fix`, `outcome`, `tags`, `timestamp`).
2. `hindsightService.retain(...)` stores the experience into the specified memory bank (`default-bank`).
3. If `HINDSIGHT_API_KEY` is present, executes live network retain via official client; otherwise records a simulated development memory with local persistence in `storeService`.

### Recall Path (`POST /analyze`)
1. User provides an incident signature (e.g. `Database connection pool exhausted under heavy traffic`).
2. `hindsightService.recall(...)` retrieves top semantically similar experiences.
3. Local ranking engine calculates composite scores combining lexical similarity with historical success rates (`success_count / (success_count + failure_count)`).

### Reflect Path (`POST /analyze`)
1. `hindsightService.reflect(...)` synthesizes historical context, past verified outcomes, and candidate fixes into a coherent recommendation.
2. An honest `memory_proof` block is attached to the API response verifying whether the reflection was synthesized live or via local fallback.

---

## ⚡ Technology 2: CascadeFlow (`@cascadeflow/core`)

### CascadeAgent Configuration
1. Created via `createCascadeAgent(options)` in `src/config/cascadeflow.js`.
2. **Groq Model Priority**: When `GROQ_API_KEY` is provided, configures ultra-fast Groq models (`llama-3.1-8b-instant` as low-cost drafter, `llama-3.3-70b-versatile` as high-capacity verifier).
3. **Multi-Model Support**: Automatically expands to OpenAI (`gpt-4o-mini`, `gpt-4o`) and Anthropic (`claude-3-5-haiku`, `claude-3-5-sonnet`) when keys are configured.
4. **Zero-Key Resilience**: Gracefully returns `null` when no LLM keys are supplied, enabling the application to boot and serve simulated audit trails without crashing.

### Runtime Intelligence Schema
Every `/analyze` response attaches a verifiable `runtime_intelligence` object:
```json
{
  "enabled": true,
  "mode": "live",
  "model_used": "llama-3.1-8b-instant (groq)",
  "total_cost": 0.00018,
  "savings_percentage": 78.4,
  "cascaded": true,
  "draft_accepted": true,
  "latency_ms": 142,
  "routing_strategy": "speculative-cascade",
  "budget_usd": 0.50,
  "message": "Candidate fix successfully refined via live CascadeAgent."
}
```

---

## 🔄 The SRE Learning Loop & Team Memory Wall

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Telemetry Preset Selected (e.g. #db-connection-pool-exhausted)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. POST /analyze Pipeline                                              │
│    • Hindsight Recall: Retrieves top matching incidents                │
│    • Bayesian Fix Ranking: Evaluates empirical success telemetry       │
│    • Risk Detection: Evaluates recurrence frequency (3+ threshold)     │
│    • Hindsight Reflect: Synthesizes contextual remediation             │
│    • CascadeFlow: Refines fix & generates runtime intelligence audit   │
│    • Memory Proof: Emits verifiable proof chip (Hindsight Live vs Fallback)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. SRE Operator Verifies Fix in Production                             │
│    • Operator applies fix and clicks [ ✓ Worked (Confirm) ]            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. POST /feedback Loop & Memory Wall Reinforcement                     │
│    • Retains verification memory in Hindsight bank                     │
│    • Increments success counter (e.g. 3x ✓ -> 4x ✓)                    │
│    • UI triggers GET /store/memory refresh                             │
│    • Memory Wall card scrolls into view with glowing emerald animation │
└────────────────────────────────────────────────────────────────────────┘
```
