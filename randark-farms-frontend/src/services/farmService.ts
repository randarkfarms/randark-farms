import api from '@/lib/axios';
import { Farm } from '@/types';

export const farmService = {
  getAll: async (params?: any): Promise<Farm[]> => {
    const response = await api.get('/farms', { params });
    // Backend returns { data: [...], page, pages, total }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // If backend returns array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Farm> => {
    const response = await api.get(`/farms/${id}`);
    return response.data;
  },
  create: async (data: Partial<Farm>): Promise<Farm> => {
    const response = await api.post('/farms', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Farm>): Promise<Farm> => {
    const response = await api.put(`/farms/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/farms/${id}`);
  },
};