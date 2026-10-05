import api from '@/lib/axios';
import { SprayingRecord } from '@/types';

export const sprayingService = {
  getAll: async (params?: any): Promise<SprayingRecord[]> => {
    const response = await api.get('/spraying', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<SprayingRecord> => {
    const response = await api.get(`/spraying/${id}`);
    return response.data;
  },
  create: async (data: Partial<SprayingRecord>): Promise<SprayingRecord> => {
    const response = await api.post('/spraying', data);
    return response.data;
  },
  update: async (id: string, data: Partial<SprayingRecord>): Promise<SprayingRecord> => {
    const response = await api.put(`/spraying/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/spraying/${id}`);
  },
};