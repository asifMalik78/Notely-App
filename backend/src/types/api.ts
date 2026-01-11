/**
 * API Types - Request/Response types
 */

import { Priority } from './entities.js';

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
  message: string;
}

// Boards
export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export interface UpdateBoardRequest {
  title?: string;
  description?: string;
}

// Columns
export interface CreateColumnRequest {
  title: string;
}

export interface UpdateColumnRequest {
  title?: string;
}

export interface UpdateColumnPositionRequest {
  position: number;
}

// Tasks
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  labelIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  labelIds?: string[];
}

export interface MoveTaskRequest {
  columnId: string;
  position: number;
}

// Labels
export interface CreateLabelRequest {
  name: string;
  color: string;
}

export interface UpdateLabelRequest {
  name?: string;
  color?: string;
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
