/**
 * Board Controller
 * Handles HTTP requests for boards, columns, and labels
 */

import { Request, Response } from 'express';
import { boardService } from '../services/board.service.js';
import {
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  updateColumnSchema,
} from '../validators/board.validator.js';
import { createLabelSchema } from '../validators/label.validator.js';
import { ValidationError } from '../utils/errors.js';

export class BoardController {
  /**
   * GET /api/boards
   * Get all boards for authenticated user
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const boards = await boardService.getUserBoards(req.user!.userId);
    res.json({ boards });
  }

  /**
   * GET /api/boards/:id
   * Get single board with columns and tasks
   */
  async getOne(req: Request, res: Response): Promise<void> {
    const board = await boardService.getBoardById(req.params.id, req.user!.userId);
    res.json({ board });
  }

  /**
   * POST /api/boards
   * Create a new board
   */
  async create(req: Request, res: Response): Promise<void> {
    const validation = createBoardSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const board = await boardService.createBoard(req.user!.userId, validation.data);
    res.status(201).json({ board });
  }

  /**
   * PUT /api/boards/:id
   * Update a board
   */
  async update(req: Request, res: Response): Promise<void> {
    const validation = updateBoardSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const board = await boardService.updateBoard(req.params.id, req.user!.userId, validation.data);
    res.json({ board });
  }

  /**
   * DELETE /api/boards/:id
   * Delete a board
   */
  async delete(req: Request, res: Response): Promise<void> {
    await boardService.deleteBoard(req.params.id, req.user!.userId);
    res.json({ message: 'Board deleted' });
  }

  // Column operations

  /**
   * POST /api/boards/:boardId/columns
   * Create a column in a board
   */
  async createColumn(req: Request, res: Response): Promise<void> {
    const validation = createColumnSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const column = await boardService.createColumn(
      req.params.boardId,
      req.user!.userId,
      validation.data
    );
    res.status(201).json({ column });
  }

  /**
   * PUT /api/boards/columns/:id
   * Update a column
   */
  async updateColumn(req: Request, res: Response): Promise<void> {
    const validation = updateColumnSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const column = await boardService.updateColumn(
      req.params.id,
      req.user!.userId,
      validation.data
    );
    res.json({ column });
  }

  /**
   * DELETE /api/boards/columns/:id
   * Delete a column
   */
  async deleteColumn(req: Request, res: Response): Promise<void> {
    await boardService.deleteColumn(req.params.id, req.user!.userId);
    res.json({ message: 'Column deleted' });
  }

  // Label operations

  /**
   * GET /api/boards/:boardId/labels
   * Get all labels for a board
   */
  async getLabels(req: Request, res: Response): Promise<void> {
    const labels = await boardService.getBoardLabels(req.params.boardId, req.user!.userId);
    res.json({ labels });
  }

  /**
   * POST /api/boards/:boardId/labels
   * Create a label for a board
   */
  async createLabel(req: Request, res: Response): Promise<void> {
    const validation = createLabelSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const label = await boardService.createLabel(
      req.params.boardId,
      req.user!.userId,
      validation.data
    );
    res.status(201).json({ label });
  }

  /**
   * DELETE /api/boards/labels/:id
   * Delete a label
   */
  async deleteLabel(req: Request, res: Response): Promise<void> {
    await boardService.deleteLabel(req.params.id, req.user!.userId);
    res.json({ message: 'Label deleted' });
  }
}

// Export singleton instance
export const boardController = new BoardController();
