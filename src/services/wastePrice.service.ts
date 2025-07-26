import api from './api';

export const wastePriceService = {
  async getWastePrices() {
    const res = await api.get('/waste-prices');
    return res.data;
  },

  async updateWastePrice(id: number, priceData: { price_per_kg: number; points_per_kg: number }) {
    const res = await api.put(`/waste-prices/${id}`, priceData);
    return res.data;
  }
}; 