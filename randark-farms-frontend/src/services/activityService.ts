import api from '@/lib/axios';
import { Activity } from '@/types';

export const activityService = {
  getAll: async (params?: any): Promise<Activity[]> => {
    const response = await api.get('/activities', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },
  create: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await api.post('/activities', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },
};