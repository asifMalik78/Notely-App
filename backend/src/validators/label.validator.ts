/**
 * Label Validators
 */

import { z } from 'zod';
import { VALIDATION } from '../config/constants.js';

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(VALIDATION.COLOR_REGEX, 'Invalid color format. Use hex color (e.g., #FF0000)'),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(VALIDATION.COLOR_REGEX, 'Invalid color format').optional(),
});

// Infer types from schemas
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
