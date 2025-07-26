import api from './api';

export const wasteService = {
  async getCategories() {
    const res = await api.get('/waste-categories');
    return res.data;
  },
  async createPickupRequest(data: any) {
    return api.post('/waste-collections', data);
  },
  async getPickupRequests() {
    return api.get('/waste-collections');
  },
  async createCategory(data: { name: string; price_per_kg?: number; points_per_kg?: number }) {
    return api.post('/waste-categories', data).then(res => res.data);
  },
  async updateCategory(id: number, data: { name: string; price_per_kg?: number; points_per_kg?: number }) {
    return api.put(`/waste-categories/${id}`, data).then(res => res.data);
  },
  async deleteCategory(id: number) {
    return api.delete(`/waste-categories/${id}`).then(res => res.data);
  },
  async updatePickupStatus(id: number, status: string) {
    return api.patch(`/waste-collections/${id}/status`, { status }).then(res => res.data);
  }
}; 