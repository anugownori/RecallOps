import { feedbackService } from '../services/feedback.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Controller to handle POST /feedback
 * Stores whether the suggested fix worked or failed and updates memory accordingly
 */
export const submitFixFeedback = async (req, res, next) => {
  try {
    const {
      issue,
      fix,
      status,
      worked,
      actual_outcome,
      notes,
      incident_id,
      bankId,
      user,
    } = req.body;

    const feedbackRecord = await feedbackService.recordFixFeedback({
      issue,
      fix,
      status,
      worked,
      actual_outcome,
      notes,
      incident_id,
      bankId,
      user,
    });

    const isSuccess = feedbackRecord.worked;
    const message = isSuccess
      ? 'Feedback recorded: Fix verified as SUCCESSFUL. Memory updated.'
      : 'Feedback recorded: Fix marked as FAILED. Memory updated with correction.';

    return ApiResponse.created(res, message, feedbackRecord);
  } catch (error) {
    next(error);
  }
};
