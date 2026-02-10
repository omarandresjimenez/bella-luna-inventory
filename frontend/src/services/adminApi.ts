import { apiClient } from './apiClient';
import axios from 'axios';
import type {
  Product,
  ProductImage,
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

  // Product Images
  uploadProductImages: async (productId: string, files: File[], variantId?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (variantId) formData.append('variantId', variantId);
    
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await axios.post<{ images: ProductImage[] }>(
      `${API_URL}/admin/products/${productId}/images`,
      formData,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        withCredentials: true,
      }
    );
    return response;
  },

  deleteProductImage: (productId: string, imageId: string) =>
    apiClient.delete<void>(`/admin/products/${productId}/images/${imageId}`),

  setPrimaryImage: (productId: string, imageId: string) =>
    apiClient.patch<void>(`/admin/products/${productId}/images/${imageId}/primary`, {}),

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

  // Category Images
  uploadCategoryImage: async (categoryId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await axios.post<{ imageUrl: string }>(
      `${API_URL}/admin/categories/${categoryId}/image`,
      formData,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        withCredentials: true,
      }
    );
    return response;
  },

  deleteCategoryImage: (categoryId: string) =>
    apiClient.delete<void>(`/admin/categories/${categoryId}/image`),

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
  }) => apiClient.get<{ orders: Order[], pagination: any }>('/admin/orders', params as Record<string, unknown>),

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
