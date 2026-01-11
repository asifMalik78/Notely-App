/**
 * Task Routes
 * Task endpoints
 * All routes are protected (require authentication)
 */

import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD
router.post('/columns/:columnId/tasks', asyncHandler(taskController.create.bind(taskController)));
router.put('/:id', asyncHandler(taskController.update.bind(taskController)));
router.patch('/:id/move', asyncHandler(taskController.move.bind(taskController)));
router.delete('/:id', asyncHandler(taskController.delete.bind(taskController)));

export default router;
