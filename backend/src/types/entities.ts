/**
 * Entity Types - Database model representations
 */

export interface User {
  id: string;
  email: string;
  password: string | null;
  name: string;
  avatarUrl: string | null;
  dob: Date | null;
  description: string | null;
  provider: string | null;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: Date;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
}

// Extended types with relations
export interface BoardWithRelations extends Board {
  columns?: ColumnWithTasks[];
  labels?: Label[];
}

export interface ColumnWithTasks extends Column {
  tasks?: TaskWithLabels[];
}

export interface TaskWithLabels extends Task {
  taskLabels?: TaskLabelWithLabel[];
}

export interface TaskLabelWithLabel extends TaskLabel {
  label: Label;
}

// Public user type (without password and providerId)
export type PublicUser = Omit<User, 'password' | 'providerId'>;
