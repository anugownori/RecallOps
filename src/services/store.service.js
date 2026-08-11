import { randomUUID } from 'crypto';
import { hindsightService } from './hindsight.service.js';

class StoreService {
  constructor() {
    /** @type {Map<string, { id: string, issue: string, root_cause: string, fix: string, outcome: string, tags: string[], structuredMetadata: object, hindsight: object, createdAt: string, success_count?: number, failure_count?: number }>} */
    this.storage = new Map();
    this.seedDefaultIncidents();
  }

  /**
   * Seed default telemetry incidents for demonstration
   */
  async seedDefaultIncidents() {
    const seeds = [
      {
        issue: 'Database connection pool exhausted under heavy traffic',
        root_cause: 'Default pool size of 10 was insufficient for 1000 req/s traffic spike',
        fix: 'Increased connection pool size to 50 and tuned client keep-alive timeout',
        outcome: 'DB connection errors eliminated under peak load spikes',
        tags: ['database', 'postgres', 'pool', 'timeout'],
        success_count: 2,
        failure_count: 0,
      },
      {
        issue: 'Database connection pool exhausted during morning peak load',
        root_cause: 'Simultaneous scheduled cron tasks acquired all available database pool slots',
        fix: 'Increased connection pool size to 50 and staggered cron job schedules',
        outcome: 'Peak morning concurrency handled without connection drops',
        tags: ['database', 'pool', 'cron'],
        success_count: 2,
        failure_count: 0,
      },
      {
        issue: 'Database connection pool exhausted during batch queue processing',
        root_cause: 'Concurrent worker threads held open transactions without releasing to pool',
        fix: 'Increased connection pool size to 50 and enforced 5s transaction timeout',
        outcome: 'Queue throughput stabilized with active pool utilization at 45%',
        tags: ['database', 'pool', 'queue'],
        success_count: 2,
        failure_count: 0,
      },
      {
        issue: 'Slow query execution causing database timeout',
        root_cause: 'Full table sequential scan due to missing index on users.email column',
        fix: 'Added composite B-tree index on (email, tenant_id) and ran ANALYZE',
        outcome: 'Query response time dropped from 2.5s to 8ms',
        tags: ['database', 'index', 'performance', 'sql'],
        success_count: 2,
        failure_count: 0,
      },
      {
        issue: 'High memory usage causing OOM in Node.js service',
        root_cause: 'Unbounded in-memory event listener cache retained detached DOM/JSON objects',
        fix: 'Implemented LRU cache with max size limit of 1000 and 15m TTL eviction',
        outcome: 'Heap usage remained stable at under 250MB under sustained load',
        tags: ['memory', 'nodejs', 'leak', 'heap'],
        success_count: 2,
        failure_count: 0,
      },
      {
        issue: 'Frontend 504 Gateway Timeout during batch export',
        root_cause: 'Synchronous CSV generation blocked Node.js event loop for > 30s',
        fix: 'Moved export to asynchronous background worker job with Redis queue & webhook',
        outcome: 'Exports handled asynchronously without HTTP gateway timeouts',
        tags: ['timeout', 'worker', 'queue', 'gateway'],
        success_count: 2,
        failure_count: 0,
      },
    ];

    for (const seed of seeds) {
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      const content = [
        `Issue: ${seed.issue}`,
        `Root Cause: ${seed.root_cause}`,
        `Fix: ${seed.fix}`,
        `Outcome: ${seed.outcome}`,
      ].join('\n');

      const structuredMetadata = {
        id,
        issue: seed.issue,
        root_cause: seed.root_cause,
        fix: seed.fix,
        outcome: seed.outcome,
        category: 'incident_resolution',
        storedAt: createdAt,
      };

      const record = {
        id,
        issue: seed.issue,
        root_cause: seed.root_cause,
        fix: seed.fix,
        outcome: seed.outcome,
        tags: ['incident', 'resolution', ...seed.tags],
        structuredMetadata,
        hindsight: { status: 'simulated_seed', bankId: 'default-bank' },
        createdAt,
        success_count: seed.success_count,
        failure_count: seed.failure_count,
        last_feedback_status: 'worked',
      };

      this.storage.set(id, record);
    }
  }

  /**
   * Store incident resolution experience in Hindsight memory with structured metadata
   * @param {Object} params
   * @param {string} params.issue
   * @param {string} params.root_cause
   * @param {string} params.fix
   * @param {string} params.outcome
   * @param {string} [params.bankId]
   * @param {string[]} [params.tags]
   * @param {Object} [params.metadata]
   */
  async storeIncident({ issue, root_cause, fix, outcome, bankId, tags = [], metadata = {} }) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const content = [
      `Issue: ${issue}`,
      `Root Cause: ${root_cause}`,
      `Fix: ${fix}`,
      `Outcome: ${outcome}`,
    ].join('\n');

    const structuredMetadata = {
      id,
      issue,
      root_cause,
      fix,
      outcome,
      category: 'incident_resolution',
      storedAt: createdAt,
      ...metadata,
    };

    const combinedTags = Array.from(
      new Set(['incident', 'resolution', 'troubleshooting', ...tags])
    );

    const hindsightResponse = await hindsightService.retain({
      bankId,
      content,
      context: `Incident: ${issue}`,
      metadata: structuredMetadata,
      tags: combinedTags,
    });

    const record = {
      id,
      issue,
      root_cause,
      fix,
      outcome,
      tags: combinedTags,
      structuredMetadata,
      hindsight: hindsightResponse,
      createdAt,
      success_count: metadata.success_count !== undefined ? metadata.success_count : 0,
      failure_count: metadata.failure_count !== undefined ? metadata.failure_count : 0,
      last_feedback_status: metadata.last_feedback_status || null,
    };

    this.storage.set(id, record);
    return record;
  }

  /**
   * Retrieve item by ID
   * @param {string} id
   */
  async getItemById(id) {
    return this.storage.get(id) || null;
  }

  /**
   * Retrieve all items
   */
  async getAllItems() {
    return Array.from(this.storage.values());
  }

  /**
   * Update an incident record with feedback status
   * @param {string} idOrIssue
   * @param {{ status: string, notes?: string, actual_outcome?: string }} feedbackData
   */
  async updateIncidentFeedback(idOrIssue, { status, notes, actual_outcome }) {
    if (!idOrIssue) return null;

    let record = this.storage.get(idOrIssue);
    if (!record) {
      for (const item of this.storage.values()) {
        if (
          item.issue.toLowerCase().trim() === idOrIssue.toLowerCase().trim() ||
          item.id === idOrIssue
        ) {
          record = item;
          break;
        }
      }
    }

    if (record) {
      record.feedback_history = record.feedback_history || [];
      record.feedback_history.push({
        status,
        notes,
        actual_outcome,
        timestamp: new Date().toISOString(),
      });
      record.last_feedback_status = status;
      if (status === 'worked') {
        record.success_count = (record.success_count || 0) + 1;
      } else if (status === 'failed') {
        record.failure_count = (record.failure_count || 0) + 1;
      }
      this.storage.set(record.id, record);
    }
    return record || null;
  }

  /**
   * Clear all items (useful for testing)
   */
  async clear() {
    this.storage.clear();
  }
}

export const storeService = new StoreService();
