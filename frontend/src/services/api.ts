import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to prevent infinite loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; dob?: string; description?: string }) =>
    api.put('/auth/me', data),
  uploadAvatar: (avatarUrl: string) =>
    api.post('/auth/me/avatar', { avatarUrl }),
  // OAuth URLs
  googleAuthUrl: `${API_URL}/api/auth/google`,
  githubAuthUrl: `${API_URL}/api/auth/github`,
};

// Boards API
export const boardsApi = {
  getAll: () => api.get('/boards'),
  getOne: (id: string) => api.get(`/boards/${id}`),
  create: (data: { title: string; description?: string }) =>
    api.post('/boards', data),
  update: (id: string, data: { title?: string; description?: string }) =>
    api.put(`/boards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/${id}`),

  // Columns
  createColumn: (boardId: string, data: { title: string; position?: number }) =>
    api.post(`/boards/${boardId}/columns`, data),
  updateColumn: (id: string, data: { title?: string; position?: number }) =>
    api.put(`/boards/columns/${id}`, data),
  deleteColumn: (id: string) => api.delete(`/boards/columns/${id}`),

  // Labels
  getLabels: (boardId: string) => api.get(`/boards/${boardId}/labels`),
  createLabel: (boardId: string, data: { name: string; color: string }) =>
    api.post(`/boards/${boardId}/labels`, data),
  deleteLabel: (id: string) => api.delete(`/boards/labels/${id}`),
};

// Tasks API
export const tasksApi = {
  create: (columnId: string, data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    labelIds?: string[];
  }) => api.post(`/tasks/columns/${columnId}/tasks`, data),
  update: (id: string, data: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    position?: number;
    labelIds?: string[];
  }) => api.put(`/tasks/${id}`, data),
  move: (id: string, data: { columnId: string; position: number }) =>
    api.patch(`/tasks/${id}/move`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export default api;
