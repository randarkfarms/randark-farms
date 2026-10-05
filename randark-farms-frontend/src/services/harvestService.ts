import api from '@/lib/axios';
import { Harvest } from '@/types';

export const harvestService = {
  getAll: async (params?: any): Promise<Harvest[]> => {
    const response = await api.get('/harvests', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Harvest> => {
    const response = await api.get(`/harvests/${id}`);
    return response.data;
  },
  create: async (data: Partial<Harvest>): Promise<Harvest> => {
    const response = await api.post('/harvests', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Harvest>): Promise<Harvest> => {
    const response = await api.put(`/harvests/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/harvests/${id}`);
  },
};