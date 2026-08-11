import { Router } from 'express';
import { z } from 'zod';
import { submitFixFeedback } from '../controllers/feedback.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const feedbackSchema = z
  .object({
    issue: z
      .string({ required_error: 'issue is required' })
      .trim()
      .min(1, 'issue cannot be empty'),
    fix: z
      .string({ required_error: 'fix is required' })
      .trim()
      .min(1, 'fix cannot be empty'),
    status: z
      .enum(['worked', 'failed', 'partial'], {
        errorMap: () => ({
          message: 'status must be either "worked", "failed", or "partial"',
        }),
      })
      .optional(),
    worked: z.boolean().optional(),
    actual_outcome: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    incident_id: z.string().trim().optional(),
    bankId: z.string().trim().optional(),
    user: z.string().trim().optional(),
  })
  .refine((data) => data.status !== undefined || data.worked !== undefined, {
    message: 'Either "status" ("worked" | "failed") or "worked" (boolean) must be provided',
  });

/**
 * @route POST /feedback
 * @desc Store whether the suggested fix worked or failed and update Hindsight memory accordingly
 */
router.post('/', validateRequest(feedbackSchema), submitFixFeedback);

export default router;
