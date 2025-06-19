import api from './api';

export interface RewardData {
  name: string;
  description?: string;
  points_required: number;
  stock: number;
  image?: string;
  expiry_date?: string;
}

export const rewardService = {
  // Rewards
  async getAllRewards() {
    const response = await api.get('/rewards');
    return response.data;
  },

  async createReward(data: RewardData) {
    const response = await api.post('/rewards', data);
    return response.data;
  },

  async updateReward(id: number, data: RewardData) {
    const response = await api.put(`/rewards/${id}`, data);
    return response.data;
  },

  async deleteReward(id: number) {
    const response = await api.delete(`/rewards/${id}`);
    return response.data;
  },

  // Reward Redemptions
  async getAllRedemptions() {
    const response = await api.get('/reward-redemptions');
    return response.data;
  },

  async createRedemption(reward_id: number) {
    const response = await api.post('/reward-redemptions', { reward_id });
    return response.data;
  },

  async updateRedemptionStatus(id: number, status: 'pending' | 'processed' | 'completed' | 'cancelled') {
    const response = await api.patch(`/reward-redemptions/${id}/status`, { status });
    return response.data;
  }
}; 