import api from '@/lib/axios';
import { Equipment } from '@/types';

export const equipmentService = {
  getAll: async (params?: any): Promise<Equipment[]> => {
    const response = await api.get('/equipment', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  create: async (data: Partial<Equipment>): Promise<Equipment> => {
    const response = await api.post('/equipment', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },
};