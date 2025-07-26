import api from './api';

export const userService = {
  async getAllUsers() {
    const res = await api.get('/users');
    return res.data;
  },

  async updateUser(id: number, userData: any) {
    const res = await api.put(`/users/${id}`, userData);
    return res.data;
  },

  async changePassword(id: number, passwordData: { currentPassword: string; newPassword: string }) {
    const res = await api.patch(`/users/${id}/password`, passwordData);
    return res.data;
  }
}; 