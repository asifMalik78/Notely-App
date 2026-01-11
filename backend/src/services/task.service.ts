/**
 * Task Service
 * Handles task business logic
 */

import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { tasks, columns, taskLabels, labels } from '../db/schema.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import type { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../validators/task.validator.js';
import type { TaskWithLabels } from '../types/entities.js';

export class TaskService {
  /**
   * Verify column access for a user
   */
  private async verifyColumnAccess(columnId: string, userId: string) {
    const column = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
      with: { board: true },
    });
    return column && column.board.userId === userId ? column : null;
  }

  /**
   * Verify task access for a user
   */
  private async verifyTaskAccess(taskId: string, userId: string) {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        column: {
          with: { board: true },
        },
      },
    });
    return task && task.column.board.userId === userId ? task : null;
  }

  /**
   * Get task with labels
   */
  private async getTaskWithLabels(taskId: string): Promise<TaskWithLabels> {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        taskLabels: {
          with: { label: true },
        },
      },
    });
    return task as TaskWithLabels;
  }

  /**
   * Create a new task
   */
  async createTask(columnId: string, userId: string, input: CreateTaskInput): Promise<TaskWithLabels> {
    const column = await this.verifyColumnAccess(columnId, userId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }

    // Get max position
    const existingTasks = await db.query.tasks.findMany({
      where: eq(tasks.columnId, columnId),
    });
    const maxPosition = existingTasks.length > 0
      ? Math.max(...existingTasks.map(t => t.position)) + 1
      : 0;

    const taskId = uuidv4();
    await db.insert(tasks).values({
      id: taskId,
      columnId,
      title: input.title,
      description: input.description || null,
      priority: input.priority || 'medium',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      position: input.position ?? maxPosition,
    });

    // Handle labels
    if (input.labelIds && input.labelIds.length > 0) {
      for (const labelId of input.labelIds) {
        const label = await db.query.labels.findFirst({
          where: and(eq(labels.id, labelId), eq(labels.boardId, column.boardId)),
        });
        if (label) {
          await db.insert(taskLabels).values({ taskId, labelId });
        }
      }
    }

    return this.getTaskWithLabels(taskId);
  }

  /**
   * Update a task
   */
  async updateTask(taskId: string, userId: string, input: UpdateTaskInput): Promise<TaskWithLabels> {
    const task = await this.verifyTaskAccess(taskId, userId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updates: Record<string, unknown> = {};
    if (input.title) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.priority) updates.priority = input.priority;
    if (input.dueDate !== undefined) {
      updates.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.position !== undefined) updates.position = input.position;

    if (Object.keys(updates).length > 0) {
      await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
    }

    // Handle labels update
    if (input.labelIds !== undefined) {
      // Remove all existing labels
      await db.delete(taskLabels).where(eq(taskLabels.taskId, taskId));

      // Add new labels
      for (const labelId of input.labelIds) {
        const label = await db.query.labels.findFirst({
          where: and(eq(labels.id, labelId), eq(labels.boardId, task.column.boardId)),
        });
        if (label) {
          await db.insert(taskLabels).values({ taskId, labelId });
        }
      }
    }

    return this.getTaskWithLabels(taskId);
  }

  /**
   * Move a task to a different column
   */
  async moveTask(taskId: string, userId: string, input: MoveTaskInput): Promise<TaskWithLabels> {
    const task = await this.verifyTaskAccess(taskId, userId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const targetColumn = await this.verifyColumnAccess(input.columnId, userId);
    if (!targetColumn) {
      throw new NotFoundError('Target column not found');
    }

    // Verify both columns are in the same board
    if (task.column.boardId !== targetColumn.boardId) {
      throw new AppError('Cannot move task to a different board', 400);
    }

    await db.update(tasks).set({
      columnId: input.columnId,
      position: input.position,
    }).where(eq(tasks.id, taskId));

    return this.getTaskWithLabels(taskId);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.verifyTaskAccess(taskId, userId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));
  }
}

// Export singleton instance
export const taskService = new TaskService();
