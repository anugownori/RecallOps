# RecallOps 60–90 Second Live Demo Guide

This script walks through the end-to-end RecallOps experience in **60 to 90 seconds**. It demonstrates **biomimetic incident memory (Hindsight)**, **multi-model runtime intelligence (CascadeFlow)**, and the **reinforcement learning moment (Team Memory Wall)**.

---

## ⚡ Zero-Key Guarantee (Works 100% Offline)

RecallOps is designed to run seamlessly with **zero API keys configured**. It utilizes an honest local fallback for Vectorize Hindsight and a simulated audit trail for CascadeFlow without fabricating live costs or throwing runtime exceptions.

---

## ⏱️ Step-by-Step Demo Script (60–90 Seconds)

### Step 1: Boot & Open Console (10s)
1. In your terminal, run:
   ```bash
   npm start
   ```
2. Open your browser to:
   ```
   http://localhost:3000/
   ```
3. **What to point out:**
   * High-density SRE telemetry dashboard with real-time health indicator.
   * Scroll down slightly to show the **Team Memory Wall** pre-loaded with historical production incident memories, status pills (`✓ Worked`, `✗ Failed`, `⏳ Pending`), and verification counts (`3x ✓`).

---

### Step 2: Launch Incident Preset & Execute Analysis (15s)
1. Click the telemetry preset chip:
   ```
   #db-connection-pool-exhausted
   ```
   *(Or paste: `Database connection pool exhausted under heavy traffic` into the search console)*.
2. Click **Execute Analysis** (or press Enter).
3. **What to point out:**
   * Analysis executes in milliseconds.
   * The **Dual Technology Verification Bar** appears above the results:
     * **Hindsight Memory Proof Chip**: Shows engine mode (`LOCAL FALLBACK` or `HINDSIGHT LIVE`), semantic recall status, reflection synthesis status, and evidence count.
     * **CascadeFlow Runtime Intelligence Chip**: Shows router mode (`SIMULATED` or `LIVE CASCADE`), model routing strategy, and latency metrics.

---

### Step 3: Inspect 3 Core DevOps Telemetry Cards (20s)
1. **Card 01: Incident Insights**:
   * Displays matched historical incidents, semantic similarity score (e.g. `95%`), and past verification counts.
2. **Card 02: Suggested Fix**:
   * Shows diagnostic root cause (`Default pool size of 10 was insufficient for 1000 req/s`).
   * Displays recommended fix command: `Increased connection pool size to 50 and tuned client keep-alive timeout`.
   * High statistical confidence score (`94% - 100% Historical Success`).
3. **Card 03: Risk Detection**:
   * Flags **HIGH RISK ALERT / Recurring Pattern Detected** (frequency: 3+ occurrences).
   * Generates rule-based **Preventive Action Playbook** (architectural safeguard: connection pool autoscaling & read replicas).

---

### Step 4: The "Learning Moment" — Operator Verification (20s)
1. On **Card 02 (Suggested Fix)**, locate the `OPERATOR VERIFICATION` bar.
2. Click the green button:
   ```
   [ ✓ Worked (Confirm) ]
   ```
3. **What to observe live:**
   * **Toast Notification**: `Memory Reinforced: Fix verified as SUCCESSFUL in Hindsight. Wall updated.`
   * **Team Memory Wall Instant Refresh**: The Memory Wall at the bottom refreshes automatically via `GET /store/memory`.
   * **Visual Reinforcement Glow**: The matching incident card smoothly scrolls into view and flashes an emerald glow (`.memory-card-highlighted`) with its success counter incremented (e.g. from `3x ✓` to `4x ✓`).
   * **Learning Loop Closed**: Future queries for similar database pool issues now have even stronger empirical reinforcement.

---

### Step 5 (Optional): Ingest a New Postmortem (15s)
1. Click the **+ Ingest Postmortem** button in the top navigation bar.
2. Fill in a quick postmortem:
   * **Issue**: `Kafka consumer lag during flash sale`
   * **Root Cause**: `Single partition thread bottleneck`
   * **Fix**: `Increased topic partitions from 4 to 16`
   * **Outcome**: `Consumer lag eliminated within 60s`
   * **Tags**: `kafka, queue, lag`
3. Click **Retain in Hindsight**.
4. The memory is immediately retained, the console automatically executes analysis on the new issue, and the Team Memory Wall immediately features the new memory card!

---

## 🌐 Live Cloud Mode (With Real API Keys)

To demonstrate live cloud vector recall, LLM reflection, and multi-model speculative cascade routing:

1. Add your API keys to `.env`:
   ```ini
   # Vectorize Hindsight (Use promo MEMHACK625 on https://hindsight.vectorize.io/)
   HINDSIGHT_API_KEY=your_hindsight_api_key_here
   HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
   HINDSIGHT_BANK_ID=default-bank

   # CascadeFlow LLM Providers (Groq is preferred for ultra-fast cascading)
   GROQ_API_KEY=gsk_your_groq_api_key_here
   OPENAI_API_KEY=sk_your_openai_key_here
   CASCADE_BUDGET_USD=0.50
   ```
2. Restart the server (`npm start`).
3. Run the exact same demo steps:
   * Hindsight chip turns to **`HINDSIGHT LIVE`** (green).
   * CascadeFlow chip turns to **`LIVE CASCADE`** displaying the live model used (`llama-3.1-8b-instant`), latency in milliseconds, and **live cost savings percentage** (e.g. `70% - 85% saved` vs frontier models).
