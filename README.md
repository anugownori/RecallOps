# RecallOps - Intelligent SRE Incident Memory & Prediction Platform

RecallOps is an enterprise-grade Site Reliability Engineering (SRE) incident intelligence and continuous memory platform powered by **Node.js**, **Express**, **Vectorize Hindsight**, and **CascadeFlow**.

It retains incident resolution experiences in biomimetic semantic memory, retrieves similar past outages, ranks fixes by empirical verification success, refines remediation scripts via multi-model cascade intelligence, detects recurring failure patterns, and predicts recurrence risk with actionable preventive playbooks.

---

## ⚡ Core Technologies & Official Integrations

RecallOps natively integrates two foundational agentic AI technologies:

### 1. Vectorize Hindsight (`@vectorize-io/hindsight-client`)
* **Website**: [https://hindsight.vectorize.io/](https://hindsight.vectorize.io/)
* **GitHub**: [https://github.com/vectorize-io/hindsight](https://github.com/vectorize-io/hindsight)
* **Official Package**: `@vectorize-io/hindsight-client`
* **Hindsight Cloud Promo Code**: Use promo code `MEMHACK625` on [Hindsight Cloud](https://hindsight.vectorize.io/) for development credits.
* **Capabilities in RecallOps**:
  * **`retain`**: Persists postmortems and verification outcomes into persistent memory banks (`default-bank`) with structured metadata.
  * **`recall`**: Semantically queries past incident resolutions to surface matching symptoms and root causes.
  * **`reflect`**: Synthesizes historical context and past verified outcomes into an actionable remediation recommendation.
  * **`memory_proof`**: Verifiable proof payload attached to every analysis response certifying live cloud vs honest local fallback mode.

### 2. CascadeFlow (`@cascadeflow/core`)
* **Documentation**: [https://docs.cascadeflow.ai/](https://docs.cascadeflow.ai/)
* **GitHub**: [https://github.com/lemony-ai/cascadeflow](https://github.com/lemony-ai/cascadeflow)
* **Official Package**: `@cascadeflow/core`
* **Capabilities in RecallOps**:
  * **Speculative Cascade Routing**: Routes incident refinement through tiered LLM models (preferring ultra-fast Groq `llama-3.1-8b-instant` drafter and `llama-3.3-70b-versatile` verifier, expandable to OpenAI `gpt-4o` and Anthropic `claude-3-5-sonnet`).
  * **Cost & Latency Optimization**: Automatically captures runtime intelligence metrics including draft acceptance, cost savings percentage (e.g. 70–85% saved), and execution latency.
  * **Runtime Intelligence Audit Trail**: Emits structured telemetry on model usage, routing strategies, budget constraints, and verification decisions.

---

## 🔄 The SRE Continuous Learning Loop

RecallOps demonstrates an active **adaptive learning loop** visualized live on the **Team Memory Wall**:

```
 ┌──────────────────────────────────────────────────────────────┐
 │                      Incident Occurs                         │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │             POST /analyze (Hindsight + CascadeFlow)          │
 │  • Hindsight Recall: Surfaces similar historical outages     │
 │  • Bayesian Ranking: Ranks candidate fixes by success rate   │
 │  • Risk Detection: Identifies recurring patterns (3+ threshold)│
 │  • Hindsight Reflect: Synthesizes contextual remediation     │
 │  • CascadeFlow: Refines fix & records runtime intelligence   │
 │  • Memory Proof: Emits verifiable proof chip (Live vs Fallback)│
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │           Operator Verifies Fix in Production                │
 │         (Operator clicks [ ✓ Worked (Confirm) ])             │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │             POST /feedback (Memory Reinforcement)            │
 │  • Retains verification memory in Hindsight bank             │
 │  • Increments success count (e.g. 3x ✓ -> 4x ✓)              │
 │  • Team Memory Wall refreshes dynamically via GET /store/memory│
 │  • Highlight animation flashes on reinforced memory card     │
 └──────────────────────────────────────────────────────────────┘
```

---

## 📁 Architecture & File Structure

```
MICROSOFT/
├── public/                    # Frontend DevOps Dashboard (Pure HTML5/CSS3/Vanilla JS)
│   ├── css/
│   │   └── style.css          # High-density dark slate DevOps design system
│   ├── js/
│   │   └── app.js             # Client controller for analysis, proof chips & Memory Wall
│   └── index.html             # High-density dashboard (Chips, 3 Cards, Memory Wall)
├── src/
│   ├── config/
│   │   ├── env.js             # Environment variable parser with budget & LLM keys
│   │   ├── hindsight.js       # Hindsight client singleton & factory
│   │   └── cascadeflow.js     # CascadeAgent factory (prefers Groq models)
│   ├── controllers/
│   │   ├── store.controller.js    # Handles POST /store and GET /store/memory
│   │   ├── analyze.controller.js  # Handles POST /analyze
│   │   └── feedback.controller.js # Handles POST /feedback
│   ├── middlewares/
│   │   ├── errorHandler.js        # Global Express error handler
│   │   ├── hindsight.middleware.js# Attaches req.hindsight to all requests
│   │   ├── notFoundHandler.js     # 404 handler for unknown routes
│   │   └── validateRequest.js     # Zod schema validation middleware
│   ├── routes/
│   │   ├── index.js               # Route aggregator & health check
│   │   ├── store.routes.js        # Route definitions for /store and /store/memory
│   │   ├── analyze.routes.js      # Route definitions for /analyze
│   │   └── feedback.routes.js     # Route definitions for /feedback
│   ├── services/
│   │   ├── hindsight.service.js   # Hindsight retain/recall/reflect service
│   │   ├── cascadeflow.service.js # CascadeFlow remediation refinement & audit
│   │   ├── store.service.js       # Incident persistence, Memory Wall & seed data
│   │   ├── analyze.service.js     # Multi-factor ranking, pattern & risk detection
│   │   └── feedback.service.js    # Feedback processing & memory reinforcement
│   ├── utils/
│   │   ├── apiError.js            # Custom operational API error class
│   │   └── apiResponse.js         # Standardized JSON response wrapper
│   ├── app.js                     # Express app setup, static hosting & middlewares
│   └── server.js                  # Server startup & graceful shutdown
├── tests/
│   └── api.test.js                # Automated integration test suite (25 tests, 9 suites)
├── .env.example                   # Sample environment configuration
├── DEMO.md                        # Click-by-click 60-90s demo instructions
├── TECH_STACK_HINDSIGHT_CASCADEFLOW.md # Technical feature-to-file mapping
├── package.json                   # Project metadata and dependencies
└── README.md                      # Platform documentation
```

---

## 🚀 Running the Application

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher (v24+ recommended)
* **npm**: v9.0.0 or higher

### 2. Installation
```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### Running WITHOUT API Keys (Zero-Key Mode)
RecallOps boots and runs completely out of the box with zero provider keys configured:
* Hindsight operates in **`local-fallback`** mode with realistic seed data.
* CascadeFlow operates in **`simulated`** mode reporting honest `$0.00` costs without fabricating metrics.
* The full UI, analyze flow, risk detection, operator feedback, and Team Memory Wall work 100% offline.

#### Running WITH API Keys (Live Cloud Mode)
Populate `.env` with your active keys:
```ini
# Hindsight Vector Memory
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=default-bank

# LLM Providers for CascadeFlow
GROQ_API_KEY=gsk_your_groq_api_key
OPENAI_API_KEY=sk_your_openai_api_key
ANTHROPIC_API_KEY=sk_your_anthropic_api_key
CASCADE_BUDGET_USD=0.50
```

### 4. Starting the Server
* **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
* **Production Mode:**
  ```bash
  npm start
  ```

Open `http://localhost:5000/login` (or `http://localhost:5000/`) in your browser.
> **Evaluator Tip**: The operator sign-in page features a one-click **"Continue as Demo Operator"** button that sets an instant SRE session without requiring external credentials.


---

## 🧪 Running Automated Tests

Run the complete integration and unit test suite via Node's native test runner:
```bash
npm test
```
*Current test status: **25 tests across 9 suites passing cleanly**.*

---

## 📡 API Endpoints Documentation

### 1. Health Check
* **Endpoint**: `GET /health`
* **Description**: Verifies service status and operational uptime.

### 2. Retrieve Team Memory Wall
* **Endpoint**: `GET /store/memory` (or `GET /store`)
* **Query Parameters**:
  * `tag`: Filter memories by tag (e.g. `?tag=database`)
  * `status`: Filter by status (`?status=worked` or `?status=failed`)
  * `limit`: Limit results count (e.g. `?limit=10`)
* **Description**: Returns all retained incident postmortems sorted **newest-first** with verification counts (`worked_count`, `failed_count`, `pending_count`), structured metadata, and global summary statistics.

### 3. Store Incident Experience in Hindsight
* **Endpoint**: `POST /store`
* **Description**: Stores incident resolution experiences (`issue`, `root_cause`, `fix`, `outcome`, `tags`) directly into Hindsight memory.

### 4. Analyze Incident, Recall Memories & Cascade Intelligence
* **Endpoint**: `POST /analyze`
* **Description**: Accepts an incident issue, performs Hindsight semantic recall, Bayesian success ranking, recurring pattern detection (3+ threshold), Hindsight reflection synthesis, and CascadeFlow runtime intelligence refinement.
* **Key Response Fields**:
  * `memory_proof`: Audit proof certifying Hindsight mode (`hindsight` vs `local-fallback`), recall status, reflection status, and evidence count.
  * `runtime_intelligence`: CascadeFlow telemetry containing `mode` (`live` | `simulated`), `model_used`, `total_cost`, `savings_percentage`, `cascaded`, `draft_accepted`, and `latency_ms`.
  * `best_fix`: Empirically top-ranked fix.
  * `recommendation`: Confidence score and historical success metrics.
  * `is_recurring`: Boolean recurrence indicator with preventive action playbook.

### 5. Submit Fix Verification Feedback & Reinforce Memory
* **Endpoint**: `POST /feedback`
* **Description**: Records whether a suggested fix worked (`status: "worked"`) or failed (`status: "failed"`), retains reinforcement memory in Hindsight, updates local incident success counters, and triggers instant Memory Wall adaptation.

---

## 📖 Additional Documentation

* **[DEMO.md](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/DEMO.md)**: 60–90 second click-by-click live demo script.
* **[TECH_STACK_HINDSIGHT_CASCADEFLOW.md](file:///c:/Users/anushree/OneDrive/hackathon/MICROSOFT/TECH_STACK_HINDSIGHT_CASCADEFLOW.md)**: Detailed feature-to-source-file technical architecture mapping.
