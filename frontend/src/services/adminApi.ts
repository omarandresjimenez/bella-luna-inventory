import { apiClient } from './apiClient';
import type {
  Product,
  Category,
  Order,
  Attribute,
  StoreSettings,
} from '../types';

interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  baseCost: number;
  basePrice: number;
  discountPercent?: number;
  trackStock?: boolean;
  categoryIds: string[];
  attributeIds: string[];
}

interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
  isFeatured?: boolean;
}

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

interface CreateAttributeData {
  name: string;
  displayName: string;
  type: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
  sortOrder?: number;
}

interface UpdateOrderStatusData {
  status: string;
  adminNotes?: string;
}

export const adminApi = {
  // Products
  getProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => apiClient.get<Product[]>('/admin/products', params as Record<string, unknown>),

  getProductById: (id: string) =>
    apiClient.get<Product>(`/admin/products/${id}`),

  createProduct: (data: CreateProductData) =>
    apiClient.post<Product>('/admin/products', data),

  updateProduct: (id: string, data: UpdateProductData) =>
    apiClient.patch<Product>(`/admin/products/${id}`, data),

  deleteProduct: (id: string) =>
    apiClient.delete<void>(`/admin/products/${id}`),

  // Categories
  getCategories: () =>
    apiClient.get<Category[]>('/admin/categories'),

  getCategoryById: (id: string) =>
    apiClient.get<Category>(`/admin/categories/${id}`),

  createCategory: (data: CreateCategoryData) =>
    apiClient.post<Category>('/admin/categories', data),

  updateCategory: (id: string, data: UpdateCategoryData) =>
    apiClient.patch<Category>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<void>(`/admin/categories/${id}`),

  // Attributes
  getAttributes: () =>
    apiClient.get<Attribute[]>('/admin/attributes'),

  createAttribute: (data: CreateAttributeData) =>
    apiClient.post<Attribute>('/admin/attributes', data),

  updateAttribute: (id: string, data: Partial<CreateAttributeData>) =>
    apiClient.patch<Attribute>(`/admin/attributes/${id}`, data),

  deleteAttribute: (id: string) =>
    apiClient.delete<void>(`/admin/attributes/${id}`),

  // Orders
  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get<Order[]>('/admin/orders', params as Record<string, unknown>),

  getOrderById: (id: string) =>
    apiClient.get<Order>(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, data: UpdateOrderStatusData) =>
    apiClient.patch<Order>(`/admin/orders/${id}/status`, data),

  // Store Settings
  getStoreSettings: () =>
    apiClient.get<StoreSettings>('/admin/settings'),

  updateStoreSettings: (data: Partial<StoreSettings>) =>
    apiClient.patch<StoreSettings>('/admin/settings', data),
};

export default adminApi;
