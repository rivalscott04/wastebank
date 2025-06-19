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
  }
}; 