import { hindsightClient, isHindsightConfigured } from '../config/hindsight.js';
import { hindsightService } from '../services/hindsight.service.js';

/**
 * Middleware that attaches Hindsight client and service helpers to the Express Request object
 */
export const hindsightMiddleware = (req, res, next) => {
  req.hindsight = hindsightClient;
  req.hindsightService = hindsightService;
  req.isHindsightConfigured = isHindsightConfigured();
  next();
};
