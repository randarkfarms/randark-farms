import api from '@/lib/axios';
import { Field } from '@/types';

export const fieldService = {
  getAll: async (params?: any): Promise<Field[]> => {
    const response = await api.get('/fields', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Field> => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },
  create: async (data: Partial<Field>): Promise<Field> => {
    const response = await api.post('/fields', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Field>): Promise<Field> => {
    const response = await api.put(`/fields/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/fields/${id}`);
  },
};