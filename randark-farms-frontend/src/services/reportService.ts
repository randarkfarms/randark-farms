import api from '@/lib/axios';
import { ReportFilters } from '@/types';

export const reportService = {
  generateReport: async (reportType: string, filters: ReportFilters) => {
    const response = await api.post(`/reports/${reportType}`, filters);
    return response.data;
  },
  exportCSV: async (reportType: string, filters: ReportFilters) => {
    const response = await api.post(`/reports/${reportType}/csv`, filters, { responseType: 'blob' });
    return response.data;
  },
  exportPDF: async (reportType: string, filters: ReportFilters) => {
    const response = await api.post(`/reports/${reportType}/pdf`, filters, { responseType: 'blob' });
    return response.data;
  },
};