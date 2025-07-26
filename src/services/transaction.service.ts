import api from './api';

export interface TransactionItemData {
  category_id: number;
  weight: number;
  price_per_kg: number;
  points_earned: number;
}

export interface TransactionData {
  user_id: number;
  waste_collection_id?: number;
  items: TransactionItemData[];
  payment_method: 'cash' | 'bank_transfer' | 'e-wallet';
  notes?: string;
}

export const transactionService = {
  async getAllTransactions() {
    const response = await api.get('/transactions');
    return response.data;
  },

  async createTransaction(data: TransactionData) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async updatePaymentStatus(id: number, payment_status: 'pending' | 'completed' | 'cancelled') {
    const response = await api.patch(`/transactions/${id}/payment`, { payment_status });
    return response.data;
  },

  async deleteTransaction(id: number) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
}; 