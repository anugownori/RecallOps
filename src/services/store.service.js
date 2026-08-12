import { randomUUID } from 'crypto';
import { hindsightService } from './hindsight.service.js';

class StoreService {
  constructor() {
    /** @type {Map<string, { id: string, issue: string, root_cause: string, fix: string, outcome: string, tags: string[], structuredMetadata: object, hindsight: object, createdAt: string, success_count?: number, failure_count?: number, last_feedback_status?: string, feedback_history?: Array<object> }>} */
    this.storage = new Map();
    this.seedDefaultIncidents();
  }

  /**
   * Seed default telemetry incidents for demonstration
   */
  async seedDefaultIncidents() {
    const baseTime = Date.now();
    const seeds = [
      {
        issue: 'Database connection pool exhausted under heavy traffic',
        root_cause: 'Default pool size of 10 was insufficient for 1000 req/s traffic spike',
        fix: 'Increased connection pool size to 50 and tuned client keep-alive timeout',
        outcome: 'DB connection errors eliminated under peak load spikes',
        tags: ['database', 'postgres', 'pool', 'timeout'],
        success_count: 3,
        failure_count: 0,
        last_feedback_status: 'worked',
        hoursAgo: 1,
      },
      {
        issue: 'Slow query execution causing database timeout',
        root_cause: 'Full table sequential scan due to missing composite index on users(email, tenant_id)',
        fix: 'Added composite B-tree index on (email, tenant_id) and executed ANALYZE',
        outcome: 'Query response time dropped from 2.5s to 8ms',
        tags: ['database', 'index', 'performance', 'sql'],
        success_count: 4,
        failure_count: 0,
        last_feedback_status: 'worked',
        hoursAgo: 3,
      },
      {
        issue: 'High memory usage causing OOM in Node.js service',
        root_cause: 'Unbounded in-memory event listener cache retained detached DOM/JSON objects',
        fix: 'Implemented LRU cache with max size limit of 1000 and 15m TTL eviction',
        outcome: 'Heap usage remained stable at under 250MB under sustained load',
        tags: ['memory', 'nodejs', 'leak', 'heap'],
        success_count: 2,
        failure_count: 0,
        last_feedback_status: 'worked',
        hoursAgo: 6,
      },
      {
        issue: 'Frontend 504 Gateway Timeout during batch export',
        root_cause: 'Synchronous CSV generation blocked Node.js event loop for > 30s',
        fix: 'Moved export to asynchronous background worker job with Redis queue & webhook',
        outcome: 'Exports handled asynchronously without HTTP gateway timeouts',
        tags: ['timeout', 'worker', 'queue', 'gateway'],
        success_count: 3,
        failure_count: 0,
        last_feedback_status: 'worked',
        hoursAgo: 10,
      },
      {
        issue: 'Redis cache eviction storm causing backend latency spike',
        root_cause: 'All session keys set with identical 24h TTL expired concurrently at midnight',
        fix: 'Added randomized jitter (+/- 15%) to Redis key TTL expirations',
        outcome: 'Cache hit ratio stabilized at 96% across midnight boundaries',
        tags: ['redis', 'cache', 'latency', 'eviction'],
        success_count: 2,
        failure_count: 1,
        last_feedback_status: 'worked',
        hoursAgo: 16,
      },
      {
        issue: 'Kafka consumer lag increasing during flash sale event',
        root_cause: 'Single partition consumer thread blocked on external billing API latency',
        fix: 'Increased topic partition count from 4 to 16 and tuned batch fetch max bytes',
        outcome: 'Consumer lag drained within 90s during peak 5000 msg/s throughput',
        tags: ['kafka', 'queue', 'lag', 'consumer'],
        success_count: 2,
        failure_count: 0,
        last_feedback_status: 'worked',
        hoursAgo: 24,
      },
      {
        issue: 'Kubernetes Ingress 502 Bad Gateway due to upstream keepalive mismatch',
        root_cause: 'Node.js server keepAliveTimeout was shorter than AWS ALB / NGINX ingress timeout',
        fix: 'Configured Node.js server.keepAliveTimeout to 65000ms and headersTimeout to 66000ms',
        outcome: 'Zero 502 Bad Gateway drops observed during ALB target group draining',
        tags: ['kubernetes', 'ingress', 'nginx', 'gateway'],
        success_count: 2,
        failure_count: 0,
        last_feedback_status: 'worked',
        hoursAgo: 36,
      },
      {
        issue: 'Stale DNS cache in internal service mesh leading to 503 Service Unavailable',
        root_cause: 'Node.js DNS resolver cached deprecated pod IP addresses indefinitely',
        fix: 'Installed dns-lookup-cache with 5s TTL override in HTTP agent',
        outcome: 'Service mesh rerouted traffic within 5s of pod restarts',
        tags: ['dns', 'servicemesh', 'network'],
        success_count: 0,
        failure_count: 1,
        last_feedback_status: 'failed',
        hoursAgo: 48,
      },
      {
        issue: 'Unindexed full-text search query locking tenant tables',
        root_cause: 'Sequential scan on unbounded audit logs table during ad-hoc queries',
        fix: 'Created PostgreSQL GIN index on to_tsvector(log_content) and partitioned by month',
        outcome: 'Pending production load validation under peak query traffic',
        tags: ['database', 'search', 'lock', 'postgres'],
        success_count: 0,
        failure_count: 0,
        last_feedback_status: 'pending',
        hoursAgo: 60,
      },
    ];

    for (const seed of seeds) {
      const id = randomUUID();
      const createdAt = new Date(baseTime - seed.hoursAgo * 3600 * 1000).toISOString();
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
        last_feedback_status: seed.last_feedback_status,
        feedback_history: [
          {
            status: seed.last_feedback_status,
            actual_outcome: seed.outcome,
            timestamp: createdAt,
          },
        ],
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
    const id = metadata.id || randomUUID();
    const createdAt = metadata.createdAt || new Date().toISOString();

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
      last_feedback_status: metadata.last_feedback_status || 'pending',
      feedback_history: [],
    };

    this.storage.set(id, record);
    return record;
  }

  /**
   * Retrieve all retained memories for the Team Memory Wall, sorted newest-first
   * with counts for worked, failed, and pending verifications.
   * @param {Object} [options]
   * @param {string} [options.tag]
   * @param {string} [options.status]
   * @param {number} [options.limit]
   */
  async getMemories({ tag, status, limit } = {}) {
    if (this.storage.size === 0) {
      await this.seedDefaultIncidents();
    }

    let items = Array.from(this.storage.values());

    // Sort newest-first (descending by createdAt timestamp)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (tag) {
      const lowerTag = tag.toLowerCase().trim();
      items = items.filter((item) =>
        (item.tags || []).some((t) => t.toLowerCase() === lowerTag)
      );
    }

    if (status) {
      const lowerStatus = status.toLowerCase().trim();
      items = items.filter((item) => {
        const itemStatus =
          item.last_feedback_status ||
          (item.success_count > 0 ? 'worked' : item.failure_count > 0 ? 'failed' : 'pending');
        return itemStatus.toLowerCase() === lowerStatus;
      });
    }

    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }

    const formattedMemories = items.map((item) => {
      const worked = item.success_count || (item.last_feedback_status === 'worked' ? 1 : 0);
      const failed = item.failure_count || (item.last_feedback_status === 'failed' ? 1 : 0);
      const pending = (worked === 0 && failed === 0) || item.last_feedback_status === 'pending' ? 1 : 0;
      const resolvedStatus =
        item.last_feedback_status || (worked > 0 ? 'worked' : failed > 0 ? 'failed' : 'pending');

      return {
        id: item.id,
        issue: item.issue,
        incident: item.issue,
        root_cause: item.root_cause,
        fix: item.fix,
        outcome: item.outcome,
        tags: item.tags || [],
        status: resolvedStatus,
        last_feedback_status: resolvedStatus,
        worked_count: worked,
        failed_count: failed,
        pending_count: pending,
        counts: {
          worked,
          failed,
          pending,
        },
        feedback_history: item.feedback_history || [],
        hindsight: item.hindsight || { status: 'simulated', bankId: 'default-bank' },
        metadata: item.structuredMetadata || {},
        createdAt: item.createdAt,
      };
    });

    const totalWorked = formattedMemories.reduce((sum, m) => sum + m.worked_count, 0);
    const totalFailed = formattedMemories.reduce((sum, m) => sum + m.failed_count, 0);
    const totalPending = formattedMemories.reduce((sum, m) => sum + m.pending_count, 0);

    return {
      total: formattedMemories.length,
      stats: {
        total_memories: formattedMemories.length,
        worked_count: totalWorked,
        failed_count: totalFailed,
        pending_count: totalPending,
      },
      memories: formattedMemories,
    };
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
   * Update an incident record with feedback status (or create memory if newly reported)
   * @param {string} idOrIssue
   * @param {Object} feedbackData
   * @param {string} feedbackData.status
   * @param {string} [feedbackData.notes]
   * @param {string} [feedbackData.actual_outcome]
   * @param {string} [feedbackData.fix]
   * @param {string} [feedbackData.root_cause]
   */
  async updateIncidentFeedback(idOrIssue, { status, notes, actual_outcome, fix, root_cause }) {
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
    } else {
      // Upsert memory so the wall immediately reflects newly verified experience
      const newId = randomUUID();
      const createdAt = new Date().toISOString();
      record = {
        id: newId,
        issue: idOrIssue,
        root_cause: root_cause || 'Identified via operator verification',
        fix: fix || 'Applied resolution fix',
        outcome: actual_outcome || (status === 'worked' ? 'Verified working' : 'Marked failed'),
        tags: ['incident', 'verification', status],
        structuredMetadata: {
          id: newId,
          issue: idOrIssue,
          fix: fix || '',
          outcome: actual_outcome || '',
          category: 'feedback_verification',
          storedAt: createdAt,
        },
        hindsight: { status: 'retained_via_feedback', bankId: 'default-bank' },
        createdAt,
        success_count: status === 'worked' ? 1 : 0,
        failure_count: status === 'failed' ? 1 : 0,
        last_feedback_status: status,
        feedback_history: [
          {
            status,
            notes,
            actual_outcome,
            timestamp: createdAt,
          },
        ],
      };
      this.storage.set(newId, record);
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
export default storeService;

