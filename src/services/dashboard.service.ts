import api from './api';

export const dashboardService = {
  async getTotalWeight() {
    const res = await api.get('/dashboard/total-weight');
    return res.data;
  }

  // getActivities() - DISABLED karena endpoint error
  // async getActivities() {
  //   const res = await api.get('/dashboard/activities');
  //   return res.data;
  // }
}; 