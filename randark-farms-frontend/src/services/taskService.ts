import api from '@/lib/axios';
import { Task } from '@/types';

export const taskService = {
  getAll: async (params?: any): Promise<Task[]> => {
    const response = await api.get('/tasks', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  create: async (data: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
  complete: async (id: string): Promise<Task> => {
    const response = await api.put(`/tasks/${id}/complete`);
    return response.data;
  },
};