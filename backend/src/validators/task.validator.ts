/**
 * Task Validators
 */

import { z } from 'zod';
import { VALIDATION, PRIORITIES } from '../config/constants.js';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(VALIDATION.TITLE_MAX_LENGTH),
  description: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional(),
  priority: z.enum(PRIORITIES).optional().default('medium'),
  dueDate: z.string().datetime().optional().nullable(),
  position: z.number().int().min(0).optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(VALIDATION.TITLE_MAX_LENGTH).optional(),
  description: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional().nullable(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  position: z.number().int().min(0).optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
  position: z.number().int().min(0),
});

// Infer types from schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
