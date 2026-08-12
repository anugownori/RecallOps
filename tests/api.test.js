import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { storeService } from '../src/services/store.service.js';
import { feedbackService } from '../src/services/feedback.service.js';

describe('Modular Express Backend API Tests', () => {
  beforeEach(async () => {
    await storeService.clear();
    await feedbackService.clear();
  });

  describe('GET /health & Static Dashboard', () => {
    it('should return 200 OK and server status', async () => {
      const response = await request(app).get('/health');

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.status, 'OK');
      assert.ok(typeof response.body.data.uptime === 'number');
    });

    it('should serve RecallOps Dashboard HTML on GET /', async () => {
      const response = await request(app).get('/');

      assert.equal(response.status, 200);
      assert.ok(response.text.includes('RecallOps'));
      assert.ok(response.text.includes('Incident Insights'));
      assert.ok(response.text.includes('Suggested Fix'));
      assert.ok(response.text.includes('Risk Detection'));
    });

    it('should serve Operator Sign-In HTML on GET /login', async () => {
      const response = await request(app).get('/login');

      assert.equal(response.status, 200);
      assert.ok(response.text.includes('Operator Sign In'));
      assert.ok(response.text.includes('Continue as Demo Operator'));
    });
  });


  describe('POST /store', () => {
    it('should store incident resolution in Hindsight with structured metadata', async () => {
      const payload = {
        issue: 'API returning 500 on database timeout',
        root_cause: 'Connection pool exhausted under heavy traffic',
        fix: 'Increased max pool size to 50 and added query timeout of 5s',
        outcome: 'Latency normalized and 0 error rate observed under load test',
        tags: ['database', 'timeout', 'performance'],
        metadata: { severity: 'P1', service: 'user-service' },
      };

      const response = await request(app)
        .post('/store')
        .send(payload);

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.equal(response.body.message, 'Incident memory stored in Hindsight successfully');
      assert.ok(response.body.data.id);
      assert.equal(response.body.data.issue, payload.issue);
      assert.equal(response.body.data.root_cause, payload.root_cause);
      assert.equal(response.body.data.fix, payload.fix);
      assert.equal(response.body.data.outcome, payload.outcome);

      // Verify structured metadata
      const meta = response.body.data.structuredMetadata;
      assert.ok(meta);
      assert.equal(meta.issue, payload.issue);
      assert.equal(meta.root_cause, payload.root_cause);
      assert.equal(meta.fix, payload.fix);
      assert.equal(meta.outcome, payload.outcome);
      assert.equal(meta.category, 'incident_resolution');
      assert.equal(meta.severity, 'P1');
      assert.equal(meta.service, 'user-service');

      // Verify Hindsight retain payload
      assert.ok(response.body.data.hindsight);
    });

    it('should return 400 Bad Request when issue is missing', async () => {
      const response = await request(app)
        .post('/store')
        .send({
          root_cause: 'Memory leak in cache worker',
          fix: 'Fixed circular reference',
          outcome: 'Memory usage stable',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'issue'));
    });

    it('should return 400 Bad Request when root_cause is missing', async () => {
      const response = await request(app)
        .post('/store')
        .send({
          issue: 'High CPU spike',
          fix: 'Optimized regex pattern',
          outcome: 'CPU usage dropped to 15%',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'root_cause'));
    });

    it('should return 400 Bad Request when fix is missing', async () => {
      const response = await request(app)
        .post('/store')
        .send({
          issue: 'High CPU spike',
          root_cause: 'Catastrophic backtracking in regex',
          outcome: 'CPU usage dropped to 15%',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'fix'));
    });

    it('should return 400 Bad Request when outcome is missing', async () => {
      const response = await request(app)
        .post('/store')
        .send({
          issue: 'High CPU spike',
          root_cause: 'Catastrophic backtracking in regex',
          fix: 'Refactored regex expression',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'outcome'));
    });
  });

  describe('GET /store/memory (Team Memory Wall)', () => {
    it('should return retained memories newest-first with worked, failed, and pending counts', async () => {
      // Clear and manually store two incidents with distinct timestamps
      await storeService.clear();

      const memory1 = await storeService.storeIncident({
        issue: 'Older incident: Redis cache evictions',
        root_cause: 'TTL expiry storm',
        fix: 'Added jitter to TTL',
        outcome: 'Cache stabilized',
        tags: ['redis', 'cache'],
        metadata: { createdAt: new Date(Date.now() - 3600000).toISOString() },
      });
      await storeService.updateIncidentFeedback(memory1.id, { status: 'worked' });

      const memory2 = await storeService.storeIncident({
        issue: 'Newer incident: Postgres pool timeout',
        root_cause: 'Pool size exhausted',
        fix: 'Increased pool size to 50',
        outcome: 'DB normalized',
        tags: ['database', 'postgres'],
        metadata: { createdAt: new Date().toISOString() },
      });
      await storeService.updateIncidentFeedback(memory2.id, { status: 'worked' });
      await storeService.updateIncidentFeedback(memory2.id, { status: 'worked' });


      const response = await request(app).get('/store/memory');

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.memories);
      assert.equal(response.body.data.total, 2);

      const memories = response.body.data.memories;
      // Should be newest-first (memory2 first, then memory1)
      assert.equal(memories[0].issue, 'Newer incident: Postgres pool timeout');
      assert.equal(memories[1].issue, 'Older incident: Redis cache evictions');

      // Verify fields required for Team Memory Wall
      assert.ok(memories[0].fix);
      assert.ok(memories[0].outcome);
      assert.ok(Array.isArray(memories[0].tags));
      assert.equal(memories[0].worked_count, 2);
      assert.equal(memories[0].failed_count, 0);
      assert.equal(memories[0].counts.worked, 2);

      // Verify stats
      assert.equal(response.body.data.stats.worked_count, 3);
      assert.equal(response.body.data.stats.failed_count, 0);
    });

    it('should auto-seed realistic memories when store is empty for offline demo', async () => {
      await storeService.clear();

      const response = await request(app).get('/store/memory');

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.total >= 6, 'Should auto-seed at least 6 realistic incidents');
      assert.ok(response.body.data.memories.length >= 6);

      // Verify items have worked/failed/pending indicators
      const hasWorked = response.body.data.memories.some((m) => m.worked_count > 0);
      const hasFailed = response.body.data.memories.some((m) => m.failed_count > 0);
      const hasPending = response.body.data.memories.some((m) => m.pending_count > 0);

      assert.ok(hasWorked, 'Should have memories marked as worked');
      assert.ok(hasFailed, 'Should have memories marked as failed');
      assert.ok(hasPending, 'Should have memories marked as pending');
    });

    it('should support tag and status query filters', async () => {
      await storeService.clear();

      const responseTag = await request(app).get('/store/memory?tag=database');
      assert.equal(responseTag.status, 200);
      assert.ok(responseTag.body.data.memories.every((m) => m.tags.includes('database')));

      const responseFailed = await request(app).get('/store/memory?status=failed');
      assert.equal(responseFailed.status, 200);
      assert.ok(responseFailed.body.data.memories.every((m) => m.status === 'failed' || m.failed_count > 0));
    });
  });

  describe('POST /analyze', () => {

    beforeEach(async () => {
      // Seed sample incidents with verification counts
      const inc1 = await storeService.storeIncident({
        issue: 'Database connection pool exhausted under heavy traffic',
        root_cause: 'Default pool size of 10 was insufficient for 1000 req/s',
        fix: 'Increased connection pool size to 50',
        outcome: 'DB connection errors eliminated under peak load',
        tags: ['database', 'postgres', 'pool'],
      });
      // Add multiple positive verifications for inc1
      await storeService.updateIncidentFeedback(inc1.id, { status: 'worked' });
      await storeService.updateIncidentFeedback(inc1.id, { status: 'worked' });

      const inc2 = await storeService.storeIncident({
        issue: 'Slow query execution causing database timeout',
        root_cause: 'Missing index on users.email column',
        fix: 'Added composite B-tree index on (email, tenant_id)',
        outcome: 'Query response time dropped from 2.5s to 8ms',
        tags: ['database', 'index', 'performance'],
      });
      await storeService.updateIncidentFeedback(inc2.id, { status: 'worked' });

      const inc3 = await storeService.storeIncident({
        issue: 'Database connection timeout under heavy traffic',
        root_cause: 'Connection leak',
        fix: 'Restarted database node without changing pool',
        outcome: 'Temporary reboot only',
        tags: ['database', 'timeout'],
      });
      // Mark inc3 fix as failed
      await storeService.updateIncidentFeedback(inc3.id, { status: 'failed' });
    });

    it('should return best fix, confidence score, and evidence reason preferring fixes that worked more times', async () => {
      const payload = {
        issue: 'Database connection pool exhausted under heavy load spikes',
      };

      const response = await request(app)
        .post('/analyze')
        .send(payload);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.message, 'Incident analysis completed successfully');
      assert.equal(response.body.data.query_issue, payload.issue);

      // Verify best fix
      assert.equal(response.body.data.best_fix, 'Increased connection pool size to 50');

      // Verify confidence score
      assert.ok(typeof response.body.data.confidence_score === 'number');
      assert.ok(response.body.data.confidence_score >= 0.7);

      // Verify reason based on past data
      assert.ok(typeof response.body.data.reason === 'string');
      assert.ok(response.body.data.reason.includes('success rate'));
      assert.ok(response.body.data.reason.includes('similarity'));

      // Verify recommendation block
      assert.ok(response.body.data.recommendation);
      assert.equal(response.body.data.recommendation.fix, 'Increased connection pool size to 50');
      assert.equal(response.body.data.recommendation.times_worked, 2);

      // Verify ranked fixes array
      const rankedFixes = response.body.data.ranked_fixes;
      assert.ok(Array.isArray(rankedFixes));
      assert.ok(rankedFixes.length > 0);
      assert.equal(rankedFixes[0].fix, 'Increased connection pool size to 50');

      // Verify downranked failed fix
      const failedFix = rankedFixes.find((f) => f.fix.includes('Restarted database node'));
      if (failedFix) {
        assert.equal(failedFix.times_failed, 1);
        assert.ok(failedFix.composite_score < rankedFixes[0].composite_score);
      }

      // Verify top 3 similar issues
      const similar = response.body.data.similar_issues;
      assert.ok(Array.isArray(similar));
      assert.ok(similar.length <= 3);

      // Verify past fixes and outcomes
      assert.ok(Array.isArray(response.body.data.past_fixes));
      assert.ok(Array.isArray(response.body.data.outcomes));

      // Verify memory_proof schema and honest fallback when Hindsight unconfigured
      const proof = response.body.data.memory_proof;
      assert.ok(proof, 'memory_proof should be present');
      assert.equal(proof.mode, 'local-fallback');
      assert.ok(proof.label.includes('Local Memory Ledger'));
      assert.equal(proof.recall_status, 'simulated');
      assert.equal(proof.reflection_status, 'simulated');
      assert.equal(typeof proof.evidence_count, 'number');

      // Verify Hindsight reflection object
      assert.ok(response.body.data.hindsight_reflection);

      // Verify runtime_intelligence audit trail fields
      const rt = response.body.data.runtime_intelligence;
      assert.ok(rt, 'runtime_intelligence should be present');
      assert.equal(typeof rt.enabled, 'boolean');
      assert.ok(['live', 'simulated', 'unavailable', 'error'].includes(rt.mode));
      assert.ok(typeof rt.model_used === 'string');
      assert.ok(typeof rt.total_cost === 'number');
      assert.ok(typeof rt.savings_percentage === 'number');
      assert.ok(typeof rt.cascaded === 'boolean');
      assert.ok(typeof rt.draft_accepted === 'boolean');
      assert.ok(typeof rt.latency_ms === 'number');
      assert.ok(typeof rt.routing_strategy === 'string');
      assert.ok(typeof rt.budget_usd === 'number');
      assert.ok(typeof rt.message === 'string');
    });



    it('should detect recurring pattern when similar issues occur 3+ times', async () => {
      // Seed 3 similar incidents
      await storeService.storeIncident({
        issue: 'Database connection pool exhausted during morning peak',
        root_cause: 'Pool size 10 was too small',
        fix: 'Increased pool size to 50',
        outcome: 'Peak handled cleanly',
        tags: ['database', 'pool'],
      });
      await storeService.storeIncident({
        issue: 'Database connection pool exhausted during marketing campaign',
        root_cause: 'Pool limit reached with sudden surge',
        fix: 'Increased pool size to 50 and tuned timeouts',
        outcome: 'Zero dropped connections',
        tags: ['database', 'pool'],
      });
      await storeService.storeIncident({
        issue: 'Database connection pool exhausted during batch job execution',
        root_cause: 'Concurrent queries consumed all connections',
        fix: 'Batched queue jobs to limit concurrent pool acquisition',
        outcome: 'DB pool remained under 80%',
        tags: ['database', 'pool'],
      });

      const response = await request(app)
        .post('/analyze')
        .send({
          issue: 'Database connection pool exhausted under high traffic',
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.pattern_alert, 'Recurring issue detected');
      assert.equal(response.body.data.is_recurring, true);
      assert.ok(response.body.data.frequency_count >= 3);
      assert.equal(response.body.data.pattern.status, 'Recurring issue detected');

      // Verify Prediction Logic
      assert.equal(response.body.data.risk_assessment, 'High risk of recurrence');
      assert.ok(typeof response.body.data.preventive_action === 'string');
      assert.ok(response.body.data.preventive_action.length > 10);
      assert.equal(response.body.data.prediction.risk_level, 'High risk of recurrence');
      assert.ok(response.body.data.prediction.preventive_action);

      assert.ok(response.body.data.reason.includes('Recurring issue detected'));

      // Verify memory_proof and runtime_intelligence present
      assert.ok(response.body.data.memory_proof);
      assert.ok(response.body.data.runtime_intelligence);
      assert.equal(typeof response.body.data.runtime_intelligence.enabled, 'boolean');
    });

    it('should not flag recurring issue when similar occurrences are under 3', async () => {
      // Clear store to ensure clean slate with only 1 incident
      await storeService.clear();
      await storeService.storeIncident({
        issue: 'Single isolated frontend syntax error',
        root_cause: 'Typo in JSX template',
        fix: 'Fixed closing tag',
        outcome: 'Build succeeded',
      });

      const response = await request(app)
        .post('/analyze')
        .send({
          issue: 'Frontend syntax error',
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.is_recurring, false);
      assert.equal(response.body.data.pattern_alert, null);
      assert.equal(response.body.data.frequency_count, 1);

      // Verify memory_proof and runtime_intelligence present
      assert.ok(response.body.data.memory_proof);
      assert.equal(response.body.data.memory_proof.mode, 'local-fallback');
      assert.ok(response.body.data.runtime_intelligence);
    });

    it('should respect custom limit parameter when provided', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({
          issue: 'Database performance issues',
          limit: 2,
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.similar_issues.length <= 2);

      // Verify memory_proof and runtime_intelligence
      assert.ok(response.body.data.memory_proof);
      assert.ok(response.body.data.runtime_intelligence);
    });

    it('should return 400 Bad Request when issue field is missing', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({});

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'issue'));
    });

  });

  describe('POST /feedback', () => {
    it('should record that a fix WORKED and update memory', async () => {
      // First store an incident
      const incident = await storeService.storeIncident({
        issue: 'Cache latency spike under high concurrency',
        root_cause: 'Missing pipeline batching in Redis calls',
        fix: 'Implemented Redis pipelining for batch reads',
        outcome: 'Latency reduced by 80%',
      });

      const payload = {
        incident_id: incident.id,
        issue: 'Cache latency spike under high concurrency',
        fix: 'Implemented Redis pipelining for batch reads',
        status: 'worked',
        actual_outcome: 'Production verified: Redis latency normalized below 2ms',
        notes: 'Pipelining resolved all queue backlog',
        user: 'sre_engineer',
      };

      const response = await request(app)
        .post('/feedback')
        .send(payload);

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.ok(response.body.message.includes('SUCCESSFUL'));
      assert.equal(response.body.data.status, 'worked');
      assert.equal(response.body.data.worked, true);
      assert.equal(response.body.data.memory_updated, true);
      assert.equal(response.body.data.linked_incident_updated, true);
      assert.ok(response.body.data.hindsight);

      // Verify that the incident in storeService has updated feedback history
      const updatedIncident = await storeService.getItemById(incident.id);
      assert.equal(updatedIncident.last_feedback_status, 'worked');
      assert.equal(updatedIncident.success_count, 1);
    });

    it('should record that a fix FAILED and update memory with correction', async () => {
      const incident = await storeService.storeIncident({
        issue: 'High memory usage in worker',
        root_cause: 'Suspected large JSON payloads',
        fix: 'Increased worker memory limit to 2GB',
        outcome: 'Temporary relief',
      });

      const payload = {
        incident_id: incident.id,
        issue: 'High memory usage in worker',
        fix: 'Increased worker memory limit to 2GB',
        status: 'failed',
        notes: 'Worker still ran out of memory after 3 hours. True cause was an event listener memory leak.',
        user: 'oncall_dev',
      };

      const response = await request(app)
        .post('/feedback')
        .send(payload);

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.ok(response.body.message.includes('FAILED'));
      assert.equal(response.body.data.status, 'failed');
      assert.equal(response.body.data.worked, false);
      assert.equal(response.body.data.memory_updated, true);
      assert.ok(response.body.data.hindsight);

      // Verify incident in storeService updated failure count
      const updatedIncident = await storeService.getItemById(incident.id);
      assert.equal(updatedIncident.last_feedback_status, 'failed');
      assert.equal(updatedIncident.failure_count, 1);
    });

    it('should support worked boolean flag (worked: true)', async () => {
      const payload = {
        issue: 'Database connection timeout',
        fix: 'Increased pool size to 50',
        worked: true,
        actual_outcome: 'Zero timeouts observed',
      };

      const response = await request(app)
        .post('/feedback')
        .send(payload);

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.status, 'worked');
      assert.equal(response.body.data.worked, true);
    });

    it('should return 400 Bad Request when issue is missing', async () => {
      const response = await request(app)
        .post('/feedback')
        .send({
          fix: 'Rebooted service',
          status: 'worked',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'issue'));
    });

    it('should return 400 Bad Request when fix is missing', async () => {
      const response = await request(app)
        .post('/feedback')
        .send({
          issue: 'Kafka consumer lag',
          status: 'worked',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.errors.some((e) => e.field === 'fix'));
    });

    it('should return 400 Bad Request when neither status nor worked is provided', async () => {
      const response = await request(app)
        .post('/feedback')
        .send({
          issue: 'Kafka consumer lag',
          fix: 'Increased partitions to 12',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });
  });

  describe('Hindsight Client & Middleware Verification', () => {
    it('should export Hindsight client singleton and factory', async () => {
      const { hindsightClient, createHindsightClient } = await import('../src/config/hindsight.js');
      assert.ok(hindsightClient);
      assert.equal(typeof hindsightClient.retain, 'function');
      assert.equal(typeof hindsightClient.recall, 'function');
      assert.equal(typeof hindsightClient.reflect, 'function');

      const customClient = createHindsightClient({ apiKey: 'custom-key-123' });
      assert.ok(customClient);
      assert.equal(typeof customClient.retain, 'function');
    });
  });

  describe('CascadeFlow Runtime Intelligence Verification', () => {
    it('should export CascadeAgent factory preferring Groq and handle zero keys safely', async () => {
      const { createCascadeAgent, isCascadeflowConfigured } = await import('../src/config/cascadeflow.js');
      assert.equal(typeof createCascadeAgent, 'function');
      assert.equal(typeof isCascadeflowConfigured, 'function');

      // Zero keys check
      assert.equal(isCascadeflowConfigured(), false);
      const defaultAgent = createCascadeAgent();
      assert.equal(defaultAgent, null);

      // Groq preferred agent creation
      const groqAgent = createCascadeAgent({
        groqApiKey: 'gsk_test_groq_key_123',
        openaiApiKey: 'sk_test_openai_key_456',
        force: true,
      });
      assert.ok(groqAgent);
      assert.equal(typeof groqAgent.run, 'function');
      assert.ok(groqAgent.getModelCount() >= 2);
      const models = groqAgent.getModels();
      // Groq models should come first
      assert.equal(models[0].provider, 'groq');
    });

    it('should return simulated runtime_intelligence audit trail when unconfigured', async () => {
      const { cascadeflowService } = await import('../src/services/cascadeflow.service.js');
      const result = await cascadeflowService.refineRemediation({
        issue: 'Database connection pool exhausted under heavy load',
        root_cause: 'Pool size too small',
        best_fix: 'Increased connection pool size to 50',
      });

      assert.ok(result);
      assert.equal(result.refined_fix, 'Increased connection pool size to 50');
      assert.ok(result.runtime_intelligence);
      assert.equal(result.runtime_intelligence.mode, 'simulated');
      assert.equal(result.runtime_intelligence.enabled, false);
      assert.equal(result.runtime_intelligence.total_cost, 0);
      assert.equal(result.runtime_intelligence.savings_percentage, 0);
      assert.equal(typeof result.runtime_intelligence.budget_usd, 'number');
    });
  });

  describe('404 Not Found Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/non-existent-route');

      assert.equal(response.status, 404);
      assert.equal(response.body.success, false);
      assert.ok(response.body.message.includes('Route not found'));
    });
  });
});

