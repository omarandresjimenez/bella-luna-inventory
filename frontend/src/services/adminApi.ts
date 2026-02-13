import { apiClient } from './apiClient';
import axios from 'axios';
import type {
  Product,
  ProductImage,
  Category,
  Order,
  Attribute,
  StoreSettings,
  PaginatedResponse,
  User,
  UserRole,
  Customer,
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
  attributeIds?: string[];
  attributes?: Array<{ attributeId: string; value?: string }>;
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

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
}

interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface CreateCustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
  isVerified?: boolean;
}

interface UpdateCustomerData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  isVerified?: boolean;
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

  // Attribute Values
  addAttributeValue: (attributeId: string, data: {
    value: string;
    displayValue?: string;
    colorHex?: string;
    sortOrder?: number;
  }) => apiClient.post<Attribute>(`/admin/attributes/${attributeId}/values`, data),

  removeAttributeValue: (valueId: string) =>
    apiClient.delete<void>(`/admin/attributes/values/${valueId}`),

  // Orders
  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get<PaginatedResponse<Order>>('/admin/orders', params as Record<string, unknown>),

  getOrderById: (id: string) =>
    apiClient.get<Order>(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, data: UpdateOrderStatusData) =>
    apiClient.patch<Order>(`/admin/orders/${id}/status`, data),

  // Store Settings
  getStoreSettings: () =>
    apiClient.get<StoreSettings>('/admin/settings'),

  updateStoreSettings: (data: Partial<StoreSettings>) =>
    apiClient.patch<StoreSettings>('/admin/settings', data),

  // Analytics
  getDashboardStats: (period?: string) =>
    apiClient.get<{
      totalOrders: number;
      totalRevenue: number;
      avgOrderValue: number;
      ordersByStatus: Array<{ status: string; _count: number }>;
      lowStockProducts: Array<{
        id: string;
        name: string;
        sku: string;
        stock: number;
        variants: Array<{
          id: string;
          variantSku: string | null;
          stock: number;
          attributeValues: Array<{
            attributeValue: {
              attribute: { name: string; displayName: string };
              value: string;
              displayValue: string | null;
            };
          }>;
        }>;
      }>;
      outOfStockCount: number;
    }>('/admin/analytics/dashboard', period ? { period } : undefined),

  getSalesOverTime: (period?: string) =>
    apiClient.get<Array<{ date: string; sales: number; orders: number }>>(
      '/admin/analytics/sales-over-time',
      period ? { period } : undefined
    ),

  getTopProducts: (params?: { limit?: number; period?: string }) =>
    apiClient.get<Array<{ name: string; quantity: number; revenue: number }>>(
      '/admin/analytics/top-products',
      params as Record<string, unknown>
    ),

  getSalesByCategory: (period?: string) =>
    apiClient.get<Array<{ name: string; revenue: number; quantity: number }>>(
      '/admin/analytics/sales-by-category',
      period ? { period } : undefined
    ),

  // Product Dynamic Attributes (with values)
  updateProductAttributes: (productId: string, attributes: Array<{
    attributeId: string;
    value: string;
  }>) => apiClient.patch<Product>(`/admin/products/${productId}/attributes`, { attributes }),

  // Variants
  getProductVariants: (productId: string) =>
    apiClient.get<Product['variants']>(`/admin/products/${productId}/variants`),

  createVariant: (productId: string, data: {
    variantSku?: string;
    cost?: number;
    price?: number;
    stock: number;
    isActive?: boolean;
    attributeValueIds: string[];
  }) => apiClient.post<Product['variants'][0]>(`/admin/products/${productId}/variants`, data),

  updateVariant: (variantId: string, data: Partial<{
    variantSku?: string;
    cost?: number;
    price?: number;
    stock: number;
    isActive?: boolean;
    attributeValueIds: string[];
  }>) => apiClient.patch<Product['variants'][0]>(`/admin/variants/${variantId}`, data),

  deleteVariant: (variantId: string) =>
    apiClient.delete<void>(`/admin/variants/${variantId}`),

  // Users
  getUsers: (params?: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
  }) => apiClient.get<User[]>('/admin/users', params as Record<string, unknown>),

  getUserById: (id: string) =>
    apiClient.get<User>(`/admin/users/${id}`),

  createUser: (data: CreateUserData) =>
    apiClient.post<User>('/admin/users', data),

  updateUser: (id: string, data: UpdateUserData) =>
    apiClient.patch<User>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    apiClient.delete<void>(`/admin/users/${id}`),

  toggleUserStatus: (id: string) =>
    apiClient.patch<User>(`/admin/users/${id}/toggle-status`, {}),

  getUsersStats: () =>
    apiClient.get<{ role: UserRole; count: number }[]>('/admin/users/stats'),

  // Customers
  getCustomers: (params?: {
    search?: string;
    isVerified?: boolean;
    hasOrders?: boolean;
  }) => apiClient.get<(Customer & { orderCount: number; totalSpent: number; addressesCount: number })[]>('/admin/customers', params as Record<string, unknown>),

  getCustomerById: (id: string) =>
    apiClient.get<Customer & { orderCount: number; addressesCount: number; totalSpent: number; addresses: any[]; recentOrders: any[] }>(`/admin/customers/${id}`),

  createCustomer: (data: CreateCustomerData) =>
    apiClient.post<Customer>('/admin/customers', data),

  updateCustomer: (id: string, data: UpdateCustomerData) =>
    apiClient.patch<Customer>(`/admin/customers/${id}`, data),

  deleteCustomer: (id: string) =>
    apiClient.delete<void>(`/admin/customers/${id}`),

  toggleCustomerVerification: (id: string) =>
    apiClient.patch<Customer>(`/admin/customers/${id}/toggle-verification`, {}),

  getCustomersStats: () =>
    apiClient.get<{
      total: number;
      verified: number;
      unverified: number;
      withOrders: number;
      totalRevenue: number;
    }>('/admin/customers/stats'),

  getRecentCustomers: (limit?: number) =>
    apiClient.get<Customer[]>('/admin/customers/recent', limit ? { limit } : undefined),
};

export default adminApi;
