import api from '@/lib/axios';
import { User } from '@/types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  resetPassword: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};