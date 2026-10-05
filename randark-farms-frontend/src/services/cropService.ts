import api from '@/lib/axios';
import { Crop } from '@/types';

export const cropService = {
  getAll: async (params?: any): Promise<Crop[]> => {
    const response = await api.get('/crops', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Crop> => {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  },
  create: async (data: Partial<Crop>): Promise<Crop> => {
    const response = await api.post('/crops', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Crop>): Promise<Crop> => {
    const response = await api.put(`/crops/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/crops/${id}`);
  },
};