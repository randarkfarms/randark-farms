import api from '@/lib/axios';
import {
  Farm,
  Field,
  Crop,
  Activity,
  SprayingRecord,
  FertilizerRecord,
  Expense,
  Harvest,
  InventoryItem,
  Equipment,
  Task,
  ReportFilters,
  DashboardData,
} from '@/types';

// Generic CRUD helper that properly extracts data from backend response
const createService = <T, TCreate, TUpdate>(resource: string) => ({
  getAll: async (params?: any): Promise<T[]> => {
    const response = await api.get(`/${resource}`, { params });
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
  getById: async (id: string): Promise<T> => {
    const response = await api.get(`/${resource}/${id}`);
    return response.data;
  },
  create: async (data: TCreate): Promise<T> => {
    const response = await api.post(`/${resource}`, data);
    return response.data;
  },
  update: async (id: string, data: TUpdate): Promise<T> => {
    const response = await api.put(`/${resource}/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/${resource}/${id}`);
  },
});

export const farmService = createService<Farm, Partial<Farm>, Partial<Farm>>('farms');
export const fieldService = createService<Field, Partial<Field>, Partial<Field>>('fields');
export const cropService = createService<Crop, Partial<Crop>, Partial<Crop>>('crops');
export const activityService = createService<Activity, Partial<Activity>, Partial<Activity>>('activities');
export const sprayingService = createService<SprayingRecord, Partial<SprayingRecord>, Partial<SprayingRecord>>('spraying');
export const fertilizerService = createService<FertilizerRecord, Partial<FertilizerRecord>, Partial<FertilizerRecord>>('fertilizers');
export const expenseService = createService<Expense, Partial<Expense>, Partial<Expense>>('expenses');
export const harvestService = createService<Harvest, Partial<Harvest>, Partial<Harvest>>('harvests');
export const inventoryService = createService<InventoryItem, Partial<InventoryItem>, Partial<InventoryItem>>('inventory');
export const equipmentService = createService<Equipment, Partial<Equipment>, Partial<Equipment>>('equipment');

// Task service with complete method
export const taskService = {
  ...createService<Task, Partial<Task>, Partial<Task>>('tasks'),
  complete: async (id: string) => (await api.put<Task>(`/tasks/${id}/complete`)).data,
};

// Dashboard
export const dashboardService = {
  getDashboardData: async () => (await api.get<DashboardData>('/dashboard')).data,
};

// Reports
export const reportService = {
  generateReport: async (reportType: string, filters: ReportFilters) =>
    (await api.post(`/reports/${reportType}`, filters)).data,
  exportPDF: async (reportType: string, filters: ReportFilters) =>
    (await api.post(`/reports/${reportType}/pdf`, filters, { responseType: 'blob' })).data,
  exportCSV: async (reportType: string, filters: ReportFilters) =>
    (await api.post(`/reports/${reportType}/csv`, filters, { responseType: 'blob' })).data,
};

export const authService = {
  login: async (email: string, password: string) => (await api.post('/auth/login', { email, password })).data,
  logout: async () => (await api.post('/auth/logout')).data,
  resetPassword: async (email: string) => (await api.post('/auth/reset-password', { email })).data,
};