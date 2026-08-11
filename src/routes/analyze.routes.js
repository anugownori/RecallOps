import { Router } from 'express';
import { z } from 'zod';
import { analyzeIssue } from '../controllers/analyze.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const analyzeSchema = z.object({
  issue: z
    .string({ required_error: 'issue is required' })
    .trim()
    .min(1, 'issue cannot be empty'),
  bankId: z.string().trim().optional(),
  limit: z.number().int().min(1).max(20).optional().default(3),
  tags: z.array(z.string().trim().min(1)).optional(),
});

/**
 * @route POST /analyze
 * @desc Takes user issue as input, searches Hindsight memory for top 3 similar issues, and returns similar issues, past fixes, and outcomes
 */
router.post('/', validateRequest(analyzeSchema), analyzeIssue);

export default router;
