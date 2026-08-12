import { randomUUID } from 'crypto';
import { hindsightService } from './hindsight.service.js';
import { storeService } from './store.service.js';

class FeedbackService {
  constructor() {
    /** @type {Map<string, Object>} */
    this.feedbacks = new Map();
  }

  /**
   * Record whether a suggested fix worked or failed and update memory accordingly
   * @param {Object} params
   * @param {string} params.issue - The issue description
   * @param {string} params.fix - The fix that was applied
   * @param {'worked' | 'failed' | 'partial'} [params.status] - Result status
   * @param {boolean} [params.worked] - Boolean indicator if fix worked
   * @param {string} [params.actual_outcome] - Observed result or outcome details
   * @param {string} [params.notes] - Additional qualitative notes
   * @param {string} [params.incident_id] - Optional ID of the related incident
   * @param {string} [params.bankId] - Target Hindsight memory bank
   * @param {string} [params.user] - Identifier for who submitted the feedback
   */
  async recordFixFeedback({
    issue,
    fix,
    status,
    worked,
    actual_outcome,
    notes,
    incident_id,
    bankId,
    user = 'anonymous',
  }) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    // Determine normalized status: 'worked' or 'failed'
    const resolvedStatus = status
      ? status
      : worked === true
      ? 'worked'
      : worked === false
      ? 'failed'
      : 'unknown';

    const isSuccess = resolvedStatus === 'worked';

    // Formulate structured experience content for Hindsight memory
    let memoryContent = '';
    if (isSuccess) {
      memoryContent = [
        `Fix Verification [SUCCESS]: The fix WORKED for the issue.`,
        `Issue: ${issue}`,
        `Effective Fix: ${fix}`,
        `Outcome: ${actual_outcome || notes || 'Issue successfully resolved.'}`,
      ].join('\n');
    } else {
      memoryContent = [
        `Fix Verification [FAILED]: The fix FAILED for the issue.`,
        `Issue: ${issue}`,
        `Ineffective Fix: ${fix}`,
        `Notes/Failure Details: ${
          notes ||
          actual_outcome ||
          'Fix did not resolve the problem. Avoid recommending without further diagnosis.'
        }`,
      ].join('\n');
    }

    const tags = [
      'feedback',
      'fix_verification',
      resolvedStatus,
      isSuccess ? 'verified_fix' : 'failed_fix',
    ];

    const structuredMetadata = {
      feedback_id: id,
      incident_id: incident_id || null,
      issue,
      fix,
      status: resolvedStatus,
      worked: isSuccess,
      notes: notes || null,
      actual_outcome: actual_outcome || null,
      submitted_by: user,
      timestamp: createdAt,
    };

    // Retain feedback in Hindsight memory
    const hindsightResponse = await hindsightService.retain({
      bankId,
      content: memoryContent,
      context: `Feedback for Fix: ${fix}`,
      metadata: structuredMetadata,
      tags,
    });

    // Update corresponding incident in storeService if linked or create newly verified memory
    const updatedIncident = await storeService.updateIncidentFeedback(
      incident_id || issue,
      {
        status: resolvedStatus,
        notes: notes || null,
        actual_outcome: actual_outcome || null,
        fix,
      }
    );


    const record = {
      id,
      issue,
      fix,
      status: resolvedStatus,
      worked: isSuccess,
      actual_outcome:
        actual_outcome ||
        (isSuccess ? 'Fix worked as expected' : 'Fix failed to resolve issue'),
      notes: notes || null,
      user,
      memory_updated: true,
      linked_incident_updated: Boolean(updatedIncident),
      structuredMetadata,
      hindsight: hindsightResponse,
      createdAt,
    };

    this.feedbacks.set(id, record);
    return record;
  }

  /**
   * Retrieve all feedback records
   */
  async getAllFeedback() {
    return Array.from(this.feedbacks.values());
  }

  /**
   * Clear all feedback (useful for tests)
   */
  async clear() {
    this.feedbacks.clear();
  }
}

export const feedbackService = new FeedbackService();
