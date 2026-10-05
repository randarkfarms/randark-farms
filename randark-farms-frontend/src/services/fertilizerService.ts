import api from '@/lib/axios';
import { FertilizerRecord } from '@/types';

export const fertilizerService = {
  getAll: async (params?: any): Promise<FertilizerRecord[]> => {
    const response = await api.get('/fertilizers', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<FertilizerRecord> => {
    const response = await api.get(`/fertilizers/${id}`);
    return response.data;
  },
  create: async (data: Partial<FertilizerRecord>): Promise<FertilizerRecord> => {
    const response = await api.post('/fertilizers', data);
    return response.data;
  },
  update: async (id: string, data: Partial<FertilizerRecord>): Promise<FertilizerRecord> => {
    const response = await api.put(`/fertilizers/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/fertilizers/${id}`);
  },
};