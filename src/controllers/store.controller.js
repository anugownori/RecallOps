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

/**
 * Controller to handle GET /store/memory
 * Retrieves retained incident memories sorted newest-first with worked/failed/pending counts
 */
export const getMemories = async (req, res, next) => {
  try {
    const { tag, status, limit } = req.query;

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const memoryData = await storeService.getMemories({
      tag,
      status,
      limit: parsedLimit,
    });

    return ApiResponse.success(
      res,
      'Retained memories retrieved successfully',
      memoryData
    );
  } catch (error) {
    next(error);
  }
};

