import { storeService } from '../services/store.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Controller to handle POST /store
 * Stores issue, root_cause, fix, and outcome in Hindsight memory
 */
export const storeIncident = async (req, res, next) => {
  try {
    const { issue, root_cause, fix, outcome, bankId, tags, metadata } = req.body;

    const storedRecord = await storeService.storeIncident({
      issue,
      root_cause,
      fix,
      outcome,
      bankId,
      tags,
      metadata,
    });

    return ApiResponse.created(
      res,
      'Incident memory stored in Hindsight successfully',
      storedRecord
    );
  } catch (error) {
    next(error);
  }
};
