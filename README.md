# RecallOps - Intelligent SRE Incident Memory & Prediction Platform

RecallOps is a full-stack, enterprise-grade SRE incident intelligence platform powered by **Node.js, Express**, and **Vectorize Hindsight**. It retains incident resolutions in biomimetic semantic memory, retrieves similar past issues, ranks fixes by empirical verification success, detects recurring failure patterns, and predicts recurrence risk with actionable preventive playbooks.

---

## 🔄 Continuous Learning & Self-Improving Feedback Loop

RecallOps demonstrates an active **adaptive learning loop**:

```
 ┌──────────────────────────────────────────────────────────────┐
 │                      Incident Occurs                         │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │             POST /analyze (Hindsight Recall)                 │
 │  • Retrieves top matching historical incidents               │
 │  • Ranks candidate fixes by past success rate & times worked │
 │  • Detects recurring failure patterns (3+ occurrences)       │
 │  • Generates recurrence risk prediction & preventive action  │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │           Operator Verifies Fix in Production                │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │             POST /feedback (Memory Reinforcement)            │
 │  • Fix Worked: Increments success count & boosts confidence  │
 │  • Fix Failed: Records failure, applies downranking penalty  │
 │  • Future queries instantly reflect updated recommendations  │
 └──────────────────────────────────────────────────────────────┘
```

---

## 📁 Architecture & Folder Structure

```
MICROSOFT/
├── public/                    # Frontend DevOps Dashboard (Pure HTML5/CSS3/Vanilla JS)
│   ├── css/
│   │   └── style.css          # High-density dark slate DevOps design system
│   ├── js/
│   │   └── app.js             # Client controller for incident analysis & verification
│   └── index.html             # High-density DevOps dashboard (Incident Insights, Fix, Risk)
├── src/
│   ├── config/
│   │   ├── env.js             # Environment variable configurations
│   │   └── hindsight.js       # Reusable Hindsight client singleton & factory
│   ├── controllers/
│   │   ├── store.controller.js    # Handles HTTP request/response for /store
│   │   ├── analyze.controller.js  # Handles HTTP request/response for /analyze
│   │   └── feedback.controller.js # Handles HTTP request/response for /feedback
│   ├── middlewares/
│   │   ├── errorHandler.js        # Global Express error handler
│   │   ├── hindsight.middleware.js# Attaches req.hindsight to all requests
│   │   ├── notFoundHandler.js     # 404 handler for unknown routes
│   │   └── validateRequest.js     # Zod schema validation middleware
│   ├── routes/
│   │   ├── index.js               # Central route aggregator & health check
│   │   ├── store.routes.js        # Route definitions for /store
│   │   ├── analyze.routes.js      # Route definitions for /analyze
│   │   └── feedback.routes.js     # Route definitions for /feedback
│   ├── services/
│   │   ├── hindsight.service.js   # Service wrapper for Hindsight retain/recall/reflect
│   │   ├── store.service.js       # Incident persistence & pre-seeded telemetry data
│   │   ├── analyze.service.js     # Multi-factor ranking, pattern detection & prediction
│   │   └── feedback.service.js    # Feedback processing & memory adaptation
│   ├── utils/
│   │   ├── apiError.js            # Custom operational API error class
│   │   └── apiResponse.js         # Standardized JSON response wrapper
│   ├── app.js                     # Express app setup, static hosting & middlewares
│   └── server.js                  # Entry point with server startup & graceful shutdown
├── tests/
│   └── api.test.js                # Automated integration test suite (20 tests)
├── .env.example                   # Sample environment configuration
├── .gitignore                     # Git ignore rules
├── package.json                   # Project metadata and dependencies
└── README.md                      # Complete system documentation
```

---

## 🧠 Hindsight Agent Memory Integration

The project integrates `@vectorize-io/hindsight-client` for persistent semantic memory with personality-driven thinking.

### Accessing the Client

#### 1. Via Direct Import (Anywhere in Backend)
```javascript
import { hindsightClient } from './src/config/hindsight.js';

// Retain a memory
await hindsightClient.retain('default-bank', 'User prefers dark mode.');

// Recall relevant memories
const memories = await hindsightClient.recall('default-bank', 'What are user preferences?');
```

#### 2. Via Express Request Object (In Any Route / Middleware)
The `hindsightMiddleware` automatically injects `req.hindsight` and `req.hindsightService`:
```javascript
router.post('/custom-action', async (req, res) => {
  const { hindsight, hindsightService } = req;
  const result = await hindsightService.recall({ query: req.body.query });
  res.json(result);
});
```

---

## 🚀 Getting Started

### 🌟 RecallOps Dashboard Web UI

RecallOps comes with an intuitive **RecallOps Dashboard** served directly at `http://localhost:5000/`.

```
--------------------------------------------------------------------------------
| ⚡ RecallOps Dashboard (Hindsight Memory & Prediction Engine)                 |
--------------------------------------------------------------------------------
| Enter Incident or Error Symptom:                                             |
| [ e.g. Database connection pool exhausted... ]        [ ⚡ Analyze Issue ]   |
| Quick Presets: [DB Pool Exhaustion] [Slow Query] [Worker OOM] [504 Timeout]   |
--------------------------------------------------------------------------------
| 🔍 Incident Insights               | 🧠 Suggested Resolution                 |
| - Top 3 Similar Incidents          | - Identified Root Cause                 |
| - Frequency Counter                | - Best Fix (with 1-click Copy)          |
| - Match Relevance %                | - Confidence Meter (0-100%)             |
|                                    | - Empirical Historical Reason           |
--------------------------------------------------------------------------------
| ⚠️ Risk & Pattern Detection        | 👍 Feedback & Memory Reinforcement      |
| - Recurring Issue Alert (3+ occurrences)| - "Did this fix work?"             |
| - Recurrence Risk: High / Low      | - [ ✅ Worked ]   [ ❌ Didn't Work ]    |
| - Suggested Preventive Action      | - Live memory update in Hindsight       |
--------------------------------------------------------------------------------
```

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` (or configure your own variables):
```bash
cp .env.example .env
```

### 4. Running the Server

- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

The server will be running at `http://localhost:5000`.

---

## 🧪 Running Automated Tests

Run the test suite via Node's native test runner:
```bash
npm test
```

---

## 📡 API Endpoints Documentation

### 1. Health Check
- **Endpoint**: `GET /health`
- **Description**: Verifies that the API service is online and healthy.
- **Example Response** (`200 OK`):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "API Server is healthy and running",
    "data": {
      "uptime": 12.34,
      "timestamp": "2026-08-12T00:00:00.000Z",
      "status": "OK"
    }
  }
  ```

---

### 2. Store Incident Resolution in Hindsight
- **Endpoint**: `POST /store`
- **Description**: Stores incident resolution experiences (`issue`, `root_cause`, `fix`, `outcome`) directly into Hindsight memory with structured metadata.
- **Request Body**:
  ```json
  {
    "issue": "API returning 500 on database connection timeout",
    "root_cause": "Connection pool exhausted during peak traffic spikes",
    "fix": "Increased pool size to 50 and set query timeout to 5000ms",
    "outcome": "Database latency stabilized under load test with 0% error rate",
    "tags": ["database", "timeout", "performance"],
    "metadata": {
      "severity": "P1",
      "service": "billing-service"
    }
  }
  ```
- **Example Response** (`201 Created`):
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Incident memory stored in Hindsight successfully",
    "data": {
      "id": "e2a1b94d-7281-4ef3-92f5-bb6ef69fdf50",
      "issue": "API returning 500 on database connection timeout",
      "root_cause": "Connection pool exhausted during peak traffic spikes",
      "fix": "Increased pool size to 50 and set query timeout to 5000ms",
      "outcome": "Database latency stabilized under load test with 0% error rate",
      "tags": [
        "incident",
        "resolution",
        "troubleshooting",
        "database",
        "timeout",
        "performance"
      ],
      "structuredMetadata": {
        "id": "e2a1b94d-7281-4ef3-92f5-bb6ef69fdf50",
        "issue": "API returning 500 on database connection timeout",
        "root_cause": "Connection pool exhausted during peak traffic spikes",
        "fix": "Increased pool size to 50 and set query timeout to 5000ms",
        "outcome": "Database latency stabilized under load test with 0% error rate",
        "category": "incident_resolution",
        "storedAt": "2026-08-12T00:00:00.000Z",
        "severity": "P1",
        "service": "billing-service"
      },
      "hindsight": {
        "status": "simulated",
        "bankId": "default-bank"
      },
      "createdAt": "2026-08-12T00:00:00.000Z"
    }
  }
  ```
- **cURL Example**:
  ```bash
  curl -X POST http://localhost:5000/store \
    -H "Content-Type: application/json" \
    -d '{
      "issue": "High memory consumption on cache node",
      "root_cause": "Cache keys created without TTL",
      "fix": "Added 24h default expiration to all cache keys",
      "outcome": "Memory reclaimed, node stable",
      "tags": ["cache", "redis", "memory"]
    }'
  ```

---

### 3. Analyze Issue, Pattern Detection & Predictive Prevention
- **Endpoint**: `POST /analyze`
- **Description**: Accepts a user issue, performs pattern detection (flags `"Recurring issue detected"` on 3+ occurrences), evaluates prediction logic (`"High risk of recurrence"`), suggests rule-based **preventive actions**, and ranks candidate fixes by historical success rate.
- **Request Body**:
  ```json
  {
    "issue": "Database connection pool exhausted during high load spikes",
    "limit": 3
  }
  ```
- **Example Response (Recurring Pattern & High Risk Prediction)** (`200 OK`):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Incident analysis completed successfully",
    "data": {
      "query_issue": "Database connection pool exhausted during high load spikes",
      "pattern_alert": "Recurring issue detected",
      "frequency_count": 3,
      "is_recurring": true,
      "risk_assessment": "High risk of recurrence",
      "preventive_action": "Implement database connection pool autoscaling, configure client-side query timeouts (5s), and add read replicas to distribute peak connection loads.",
      "prediction": {
        "risk_level": "High risk of recurrence",
        "preventive_action": "Implement database connection pool autoscaling, configure client-side query timeouts (5s), and add read replicas to distribute peak connection loads.",
        "is_high_risk": true,
        "rule_applied": "Database connection resource exhaustion rule"
      },
      "pattern": {
        "status": "Recurring issue detected",
        "is_recurring": true,
        "frequency_count": 3,
        "threshold": 3
      },
      "best_fix": "Increased connection pool size to 50",
      "confidence_score": 0.94,
      "reason": "Recommended because it has a 100% historical success rate (verified in 2 past incident(s)) with 95% similarity to the reported issue. Past verified outcome: \"DB connection errors eliminated under peak load\". (Note: Recurring issue detected - occurred 3 times; high risk of recurrence).",
      "recommendation": {
        "fix": "Increased connection pool size to 50",
        "confidence_score": 0.94,
        "success_rate": "100%",
        "times_worked": 2,
        "times_failed": 0,
        "pattern_alert": "Recurring issue detected",
        "risk_assessment": "High risk of recurrence",
        "preventive_action": "Implement database connection pool autoscaling, configure client-side query timeouts (5s), and add read replicas to distribute peak connection loads.",
        "frequency_count": 3,
        "reason": "Recommended because it has a 100% historical success rate (verified in 2 past incident(s)) with 95% similarity to the reported issue. Past verified outcome: \"DB connection errors eliminated under peak load\". (Note: Recurring issue detected - occurred 3 times; high risk of recurrence)."
      },
      "ranked_fixes": [
        {
          "fix": "Increased connection pool size to 50",
          "confidence_score": 0.94,
          "composite_score": 0.93,
          "success_rate": 1.0,
          "times_worked": 2,
          "times_failed": 0,
          "average_relevance": 0.95,
          "outcomes": ["DB connection errors eliminated under peak load"]
        }
      ],
      "total_matches": 3,
      "similar_issues": [
        {
          "id": "e2a1b94d-7281-4ef3-92f5-bb6ef69fdf50",
          "issue": "Database connection pool exhausted under heavy traffic",
          "root_cause": "Default pool size of 10 was insufficient for 1000 req/s",
          "fix": "Increased connection pool size to 50",
          "outcome": "DB connection errors eliminated under peak load",
          "relevance_score": 0.95,
          "success_rate": 1.0,
          "times_worked": 2,
          "times_failed": 0,
          "tags": ["database", "postgres", "pool"],
          "storedAt": "2026-08-12T00:00:00.000Z"
        }
      ],
      "past_fixes": [
        "Increased connection pool size to 50"
      ],
      "outcomes": [
        "DB connection errors eliminated under peak load"
      ],
      "hindsight_search": {
        "status": "simulated",
        "bankId": "default-bank",
        "query": "Database connection pool exhausted during high load spikes"
      }
    }
  }
  ```
- **cURL Example**:
  ```bash
  curl -X POST http://localhost:5000/analyze \
    -H "Content-Type: application/json" \
    -d '{"issue": "Database connection pool exhausted during peak traffic"}'
  ```

---

### 4. Submit Fix Verification Feedback & Update Memory
- **Endpoint**: `POST /feedback`
- **Description**: Records whether a suggested fix worked or failed for an issue, retains a reinforcement/correction experience in Hindsight, and updates linked incident memory records.
- **Request Body**:
  ```json
  {
    "incident_id": "e2a1b94d-7281-4ef3-92f5-bb6ef69fdf50",
    "issue": "Database connection pool exhausted under heavy traffic",
    "fix": "Increased connection pool size to 50",
    "status": "worked",
    "actual_outcome": "Connection errors eliminated completely in peak traffic",
    "notes": "Optimal pool size between 50-75",
    "user": "sre_team"
  }
  ```
  *(Alternatively, you can pass `"worked": true` or `"worked": false`)*

- **Example Response (Success - Fix Worked)** (`201 Created`):
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Feedback recorded: Fix verified as SUCCESSFUL. Memory updated.",
    "data": {
      "id": "c1f76d91-3b4e-4e89-a29e-c859f131a980",
      "issue": "Database connection pool exhausted under heavy traffic",
      "fix": "Increased connection pool size to 50",
      "status": "worked",
      "worked": true,
      "actual_outcome": "Connection errors eliminated completely in peak traffic",
      "notes": "Optimal pool size between 50-75",
      "user": "sre_team",
      "memory_updated": true,
      "linked_incident_updated": true,
      "structuredMetadata": {
        "feedback_id": "c1f76d91-3b4e-4e89-a29e-c859f131a980",
        "incident_id": "e2a1b94d-7281-4ef3-92f5-bb6ef69fdf50",
        "issue": "Database connection pool exhausted under heavy traffic",
        "fix": "Increased connection pool size to 50",
        "status": "worked",
        "worked": true,
        "notes": "Optimal pool size between 50-75",
        "actual_outcome": "Connection errors eliminated completely in peak traffic",
        "submitted_by": "sre_team",
        "timestamp": "2026-08-12T00:00:00.000Z"
      },
      "hindsight": {
        "status": "simulated",
        "bankId": "default-bank"
      },
      "createdAt": "2026-08-12T00:00:00.000Z"
    }
  }
  ```

- **cURL Example (Fix Worked)**:
  ```bash
  curl -X POST http://localhost:5000/feedback \
    -H "Content-Type: application/json" \
    -d '{
      "issue": "Postgres connection timeout",
      "fix": "Added index on users.email",
      "status": "worked",
      "actual_outcome": "Latency dropped from 2.5s to 8ms"
    }'
  ```

- **cURL Example (Fix Failed / Correction)**:
  ```bash
  curl -X POST http://localhost:5000/feedback \
    -H "Content-Type: application/json" \
    -d '{
      "issue": "High memory consumption in worker",
      "fix": "Increased container memory limit to 2GB",
      "status": "failed",
      "notes": "Did not solve the root cause; true cause was an unbounded listener cache"
    }'
  ```

---

## 🛡️ Error Handling & Validation

When a validation error or operational issue occurs, responses consistently follow the structure:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed for request data",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5",
      "rule": "too_big"
    }
  ]
}
```
