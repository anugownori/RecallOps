import { Router } from 'express';
import { z } from 'zod';
import { storeIncident, getMemories } from '../controllers/store.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const storeSchema = z.object({
  issue: z
    .string({ required_error: 'issue is required' })
    .trim()
    .min(1, 'issue cannot be empty'),
  root_cause: z
    .string({ required_error: 'root_cause is required' })
    .trim()
    .min(1, 'root_cause cannot be empty'),
  fix: z
    .string({ required_error: 'fix is required' })
    .trim()
    .min(1, 'fix cannot be empty'),
  outcome: z
    .string({ required_error: 'outcome is required' })
    .trim()
    .min(1, 'outcome cannot be empty'),
  bankId: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * @route GET /store/memory
 * @desc Retrieve retained incident memories for Team Memory Wall sorted newest-first
 */
router.get('/memory', getMemories);

/**
 * @route GET /store
 * @desc Alias to retrieve retained incident memories
 */
router.get('/', getMemories);

/**
 * @route POST /store
 * @desc Store incident resolution experience (issue, root_cause, fix, outcome) in Hindsight memory with structured metadata
 */
router.post('/', validateRequest(storeSchema), storeIncident);

export default router;

