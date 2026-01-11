/**
 * Board Routes
 * Board, column, and label endpoints
 * All routes are protected (require authentication)
 */

import { Router } from 'express';
import { boardController } from '../controllers/board.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All board routes require authentication
router.use(authMiddleware);

// Board CRUD
router.get('/', asyncHandler(boardController.getAll.bind(boardController)));
router.post('/', asyncHandler(boardController.create.bind(boardController)));
router.get('/:id', asyncHandler(boardController.getOne.bind(boardController)));
router.put('/:id', asyncHandler(boardController.update.bind(boardController)));
router.delete('/:id', asyncHandler(boardController.delete.bind(boardController)));

// Column operations
router.post('/:boardId/columns', asyncHandler(boardController.createColumn.bind(boardController)));
router.put('/columns/:id', asyncHandler(boardController.updateColumn.bind(boardController)));
router.delete('/columns/:id', asyncHandler(boardController.deleteColumn.bind(boardController)));

// Label operations
router.get('/:boardId/labels', asyncHandler(boardController.getLabels.bind(boardController)));
router.post('/:boardId/labels', asyncHandler(boardController.createLabel.bind(boardController)));
router.delete('/labels/:id', asyncHandler(boardController.deleteLabel.bind(boardController)));

export default router;
