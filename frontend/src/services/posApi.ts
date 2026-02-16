import { apiClient } from './apiClient';
import type { CreatePOSSaleRequest, POSSale } from '../types/pos';

export const posApi = {
  // Create a new POS sale
  createSale: async (saleData: CreatePOSSaleRequest): Promise<POSSale> => {
    const response = await apiClient.post('/admin/pos/sales', saleData);
    return response.data.data as POSSale;
  },

  // Get POS sales with filters
  getSales: async (params?: {
    page?: number;
    limit?: number;
    status?: 'COMPLETED' | 'VOIDED';
    paymentType?: 'CASH' | 'CARD' | 'CHECK';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/admin/pos/sales', { params });
    return response.data.data;
  },

  // Get single POS sale
  getSaleById: async (id: string): Promise<POSSale> => {
    const response = await apiClient.get(`/admin/pos/sales/${id}`);
    return response.data.data as POSSale;
  },

  // Void a POS sale
  voidSale: async (id: string): Promise<POSSale> => {
    const response = await apiClient.post(`/admin/pos/sales/${id}/void`);
    return response.data.data as POSSale;
  },

  // Get POS summary
  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/admin/pos/summary', { params });
    return response.data.data;
  },

  // Get top products by POS sales
  getTopProducts: async (params?: { limit?: number; period?: number }) => {
    const response = await apiClient.get('/admin/pos/top-products', { params });
    return response.data.data;
  },
};
