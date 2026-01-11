/**
 * Task Controller
 * Handles HTTP requests for tasks
 */

import { Request, Response } from 'express';
import { taskService } from '../services/task.service.js';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '../validators/task.validator.js';
import { ValidationError } from '../utils/errors.js';

export class TaskController {
  /**
   * POST /api/tasks/columns/:columnId/tasks
   * Create a task in a column
   */
  async create(req: Request, res: Response): Promise<void> {
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const task = await taskService.createTask(
      req.params.columnId,
      req.user!.userId,
      validation.data
    );
    res.status(201).json({ task });
  }

  /**
   * PUT /api/tasks/:id
   * Update a task
   */
  async update(req: Request, res: Response): Promise<void> {
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const task = await taskService.updateTask(req.params.id, req.user!.userId, validation.data);
    res.json({ task });
  }

  /**
   * PATCH /api/tasks/:id/move
   * Move a task to a different column
   */
  async move(req: Request, res: Response): Promise<void> {
    const validation = moveTaskSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const task = await taskService.moveTask(req.params.id, req.user!.userId, validation.data);
    res.json({ task });
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  async delete(req: Request, res: Response): Promise<void> {
    await taskService.deleteTask(req.params.id, req.user!.userId);
    res.json({ message: 'Task deleted' });
  }
}

// Export singleton instance
export const taskController = new TaskController();
