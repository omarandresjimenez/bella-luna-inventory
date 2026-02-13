import { apiClient } from './apiClient';
import type { Category, Product, StoreSettings } from '../types';

interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const publicApi = {
  // Categories
  getCategories: () =>
    apiClient.get<Category[]>('/categories'),

  getCategoryBySlug: (slug: string) =>
    apiClient.get<Category>(`/categories/${slug}`),

  // Products
  getProducts: (params?: GetProductsParams) =>
    apiClient.get<Product[]>('/products', params as Record<string, unknown>),

  getFeaturedProducts: () =>
    apiClient.get<Product[]>('/products/featured'),

  getProductBySlug: (slug: string) =>
    apiClient.get<Product>(`/products/${slug}`),

  getProductById: (id: string) =>
    apiClient.get<Product>(`/products/by-id/${id}`),

  getProductsByCategory: (categorySlug: string, params?: Omit<GetProductsParams, 'category'>) =>
    apiClient.get<Product[]>('/products', {
      ...params,
      category: categorySlug,
    } as Record<string, unknown>),

  // Store settings
  getStoreSettings: () =>
    apiClient.get<StoreSettings>('/store/settings'),
};

export default publicApi;
