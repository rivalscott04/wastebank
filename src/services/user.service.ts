import api from './api';

export interface UserUpdateData {
  name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

export const userService = {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(id: number) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateUser(id: number, data: UserUpdateData) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async updateUserPoints(id: number, points: number) {
    const response = await api.patch(`/users/${id}/points`, { points });
    return response.data;
  }
}; 