import api from '@/lib/axios';
import { Expense } from '@/types';

export const expenseService = {
  getAll: async (params?: any): Promise<Expense[]> => {
    const response = await api.get('/expenses', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  create: async (data: Partial<Expense>): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};