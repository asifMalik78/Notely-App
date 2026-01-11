/**
 * Board Service
 * Handles board, column, and label business logic
 */

import { eq, and, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { boards, columns, labels } from '../db/schema.js';
import { NotFoundError } from '../utils/errors.js';
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from '../validators/board.validator.js';
import type { CreateLabelInput } from '../validators/label.validator.js';
import type { Board, Column, Label, BoardWithRelations } from '../types/entities.js';

export class BoardService {
  /**
   * Get all boards for a user
   */
  async getUserBoards(userId: string): Promise<Board[]> {
    const userBoards = await db.query.boards.findMany({
      where: eq(boards.userId, userId),
      orderBy: [boards.createdAt],
    });
    return userBoards;
  }

  /**
   * Get single board with all relations
   */
  async getBoardById(boardId: string, userId: string): Promise<BoardWithRelations> {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
      with: {
        columns: {
          orderBy: [asc(columns.position)],
          with: {
            tasks: {
              orderBy: (tasks, { asc }) => [asc(tasks.position)],
              with: {
                taskLabels: {
                  with: {
                    label: true,
                  },
                },
              },
            },
          },
        },
        labels: true,
      },
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    return board as BoardWithRelations;
  }

  /**
   * Create a new board with default columns
   */
  async createBoard(userId: string, input: CreateBoardInput): Promise<BoardWithRelations> {
    const { title, description } = input;
    const boardId = uuidv4();

    await db.insert(boards).values({
      id: boardId,
      userId,
      title,
      description: description || null,
    });

    // Create default columns
    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultColumns.length; i++) {
      await db.insert(columns).values({
        id: uuidv4(),
        boardId,
        title: defaultColumns[i],
        position: i,
      });
    }

    return this.getBoardById(boardId, userId);
  }

  /**
   * Update a board
   */
  async updateBoard(boardId: string, userId: string, input: UpdateBoardInput): Promise<Board> {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    const updates: Record<string, unknown> = {};
    if (input.title) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;

    if (Object.keys(updates).length > 0) {
      await db.update(boards).set(updates).where(eq(boards.id, boardId));
    }

    const updatedBoard = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    return updatedBoard!;
  }

  /**
   * Delete a board
   */
  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    await db.delete(boards).where(eq(boards.id, boardId));
  }

  /**
   * Create a column
   */
  async createColumn(boardId: string, userId: string, input: CreateColumnInput): Promise<Column> {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    // Get max position
    const existingColumns = await db.query.columns.findMany({
      where: eq(columns.boardId, boardId),
    });
    const maxPosition =
      existingColumns.length > 0 ? Math.max(...existingColumns.map((c) => c.position)) + 1 : 0;

    const columnId = uuidv4();
    await db.insert(columns).values({
      id: columnId,
      boardId,
      title: input.title,
      position: input.position ?? maxPosition,
    });

    const newColumn = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
    });

    return newColumn!;
  }

  /**
   * Update a column
   */
  async updateColumn(columnId: string, userId: string, input: UpdateColumnInput): Promise<Column> {
    const column = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
      with: { board: true },
    });

    if (!column || column.board.userId !== userId) {
      throw new NotFoundError('Column not found');
    }

    const updates: Record<string, unknown> = {};
    if (input.title) updates.title = input.title;
    if (input.position !== undefined) updates.position = input.position;

    if (Object.keys(updates).length > 0) {
      await db.update(columns).set(updates).where(eq(columns.id, columnId));
    }

    const updatedColumn = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
    });

    return updatedColumn!;
  }

  /**
   * Delete a column
   */
  async deleteColumn(columnId: string, userId: string): Promise<void> {
    const column = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
      with: { board: true },
    });

    if (!column || column.board.userId !== userId) {
      throw new NotFoundError('Column not found');
    }

    await db.delete(columns).where(eq(columns.id, columnId));
  }

  /**
   * Get labels for a board
   */
  async getBoardLabels(boardId: string, userId: string): Promise<Label[]> {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    const boardLabels = await db.query.labels.findMany({
      where: eq(labels.boardId, boardId),
    });

    return boardLabels;
  }

  /**
   * Create a label
   */
  async createLabel(boardId: string, userId: string, input: CreateLabelInput): Promise<Label> {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    const labelId = uuidv4();
    await db.insert(labels).values({
      id: labelId,
      boardId,
      name: input.name,
      color: input.color,
    });

    const newLabel = await db.query.labels.findFirst({
      where: eq(labels.id, labelId),
    });

    return newLabel!;
  }

  /**
   * Delete a label
   */
  async deleteLabel(labelId: string, userId: string): Promise<void> {
    const label = await db.query.labels.findFirst({
      where: eq(labels.id, labelId),
      with: { board: true },
    });

    if (!label || label.board.userId !== userId) {
      throw new NotFoundError('Label not found');
    }

    await db.delete(labels).where(eq(labels.id, labelId));
  }
}

// Export singleton instance
export const boardService = new BoardService();
