import { Router } from 'express';
import storeRoutes from './store.routes.js';
import analyzeRoutes from './analyze.routes.js';
import feedbackRoutes from './feedback.routes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Health Check Endpoint
router.get('/health', (req, res) => {
  return ApiResponse.success(res, 'API Server is healthy and running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
  });
});

// Dedicated Operator Login Route
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/login.html'));
});

// Mount Routes
router.use('/store', storeRoutes);
router.use('/analyze', analyzeRoutes);
router.use('/feedback', feedbackRoutes);

export default router;

