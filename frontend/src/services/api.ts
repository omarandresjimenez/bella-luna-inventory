const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitCost: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  maxStock: number;
  location?: string;
  barcode?: string;
  isActive: boolean;
  categoryId: string;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  unitCost: number;
  salePrice: number;
  quantity: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  barcode?: string;
  categoryId: string;
  supplierId?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'An error occurred');
    }

    return response.json();
  }

  // Products
  async getProducts(): Promise<{ success: boolean; data: Product[] }> {
    return this.request('/products');
  }

  async getProduct(id: string): Promise<{ success: boolean; data: Product }> {
    return this.request(`/products/${id}`);
  }

  async getLowStockProducts(): Promise<{ success: boolean; data: Product[] }> {
    return this.request('/products/low-stock');
  }

  async createProduct(data: CreateProductData): Promise<{ success: boolean; data: Product }> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<{ success: boolean; data: Product }> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
