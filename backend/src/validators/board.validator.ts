/**
 * Board Validators
 */

import { z } from 'zod';
import { VALIDATION } from '../config/constants.js';

export const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(VALIDATION.TITLE_MAX_LENGTH),
  description: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1).max(VALIDATION.TITLE_MAX_LENGTH).optional(),
  description: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional(),
});

export const createColumnSchema = z.object({
  title: z.string().min(1, 'Title is required').max(VALIDATION.TITLE_MAX_LENGTH),
  position: z.number().int().min(0).optional(),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(VALIDATION.TITLE_MAX_LENGTH).optional(),
  position: z.number().int().min(0).optional(),
});

// Infer types from schemas
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
