export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  dob?: string;
  description?: string;
  provider?: string;
  createdAt?: string;
}

export interface Board {
  id: string;
  userId: string;
  title: string;
  description?: string;
  columns?: Column[];
  labels?: Label[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  tasks?: Task[];
  createdAt: string;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  position: number;
  taskLabels?: TaskLabel[];
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  label: Label;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  labelIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  position?: number;
}

export interface MoveTaskInput {
  columnId: string;
  position: number;
}
