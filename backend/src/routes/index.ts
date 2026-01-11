/**
 * Routes Index
 * Central route configuration
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import boardRoutes from './boards.js';
import taskRoutes from './tasks.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);
router.use('/tasks', taskRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
