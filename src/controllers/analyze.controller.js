import { analyzeService } from '../services/analyze.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Controller to handle POST /analyze
 * Takes user issue as input, searches Hindsight memory for similar issues (top 3),
 * and returns similar issues, past fixes, and outcomes.
 */
export const analyzeIssue = async (req, res, next) => {
  try {
    const { issue, bankId, limit, tags } = req.body;

    const analysisResult = await analyzeService.analyzeIssue({
      issue,
      bankId,
      limit,
      tags,
    });

    return ApiResponse.success(
      res,
      'Incident analysis completed successfully',
      analysisResult
    );
  } catch (error) {
    next(error);
  }
};
