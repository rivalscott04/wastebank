import api from './api';

export const authService = {
  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async register(userData: { name: string; email: string; password: string; role: string; phone: string; address: string }) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  }
}; 