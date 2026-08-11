import { Router } from 'express';
import storeRoutes from './store.routes.js';
import analyzeRoutes from './analyze.routes.js';
import feedbackRoutes from './feedback.routes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  return ApiResponse.success(res, 'API Server is healthy and running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
  });
});

// Mount Routes
router.use('/store', storeRoutes);
router.use('/analyze', analyzeRoutes);
router.use('/feedback', feedbackRoutes);

export default router;
