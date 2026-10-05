import api from '@/lib/axios';
import { InventoryItem } from '@/types';

export const inventoryService = {
  getAll: async (params?: any): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
  getById: async (id: string): Promise<InventoryItem> => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },
  create: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.post('/inventory', data);
    return response.data;
  },
  update: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
  recordMovement: async (data: { item_id: string; type: 'in' | 'out'; quantity: number; reference?: string; notes?: string }) => {
    const response = await api.post('/inventory/movement', data);
    return response.data;
  },
};