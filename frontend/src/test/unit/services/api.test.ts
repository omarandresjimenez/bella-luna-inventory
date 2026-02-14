import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../../../services/api';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import type { Product } from '../../../services/api';

describe('api (legacy service)', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Products', () => {
    it('should fetch all products successfully', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'PROD-001',
          name: 'Test Product 1',
          description: 'Test description 1',
          unitCost: 50,
          salePrice: 100,
          quantity: 100,
          minStock: 10,
          maxStock: 500,
          location: 'A1',
          barcode: '123456789',
          isActive: true,
          categoryId: 'cat-1',
          supplierId: 'sup-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          sku: 'PROD-002',
          name: 'Test Product 2',
          description: 'Test description 2',
          unitCost: 30,
          salePrice: 60,
          quantity: 50,
          minStock: 5,
          maxStock: 200,
          location: 'B2',
          barcode: '987654321',
          isActive: true,
          categoryId: 'cat-2',
          supplierId: 'sup-2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/products', () => {
          return HttpResponse.json({
            success: true,
            data: mockProducts,
          });
        })
      );

      const result = await apiService.getProducts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].sku).toBe('PROD-001');
    });

    it('should fetch a single product by id', async () => {
      const mockProduct: Product = {
        id: '1',
        sku: 'PROD-001',
        name: 'Test Product',
        description: 'Test description',
        unitCost: 50,
        salePrice: 100,
        quantity: 100,
        minStock: 10,
        maxStock: 500,
        location: 'A1',
        barcode: '123456789',
        isActive: true,
        categoryId: 'cat-1',
        supplierId: 'sup-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      server.use(
        http.get('http://localhost:3000/api/products/1', () => {
          return HttpResponse.json({
            success: true,
            data: mockProduct,
          });
        })
      );

      const result = await apiService.getProduct('1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.name).toBe('Test Product');
    });

    it('should fetch low stock products', async () => {
      const mockLowStockProducts: Product[] = [
        {
          id: '1',
          sku: 'PROD-001',
          name: 'Low Stock Product',
          unitCost: 50,
          salePrice: 100,
          quantity: 5,
          minStock: 10,
          maxStock: 100,
          isActive: true,
          categoryId: 'cat-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/products/low-stock', () => {
          return HttpResponse.json({
            success: true,
            data: mockLowStockProducts,
          });
        })
      );

      const result = await apiService.getLowStockProducts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].quantity).toBeLessThan(result.data[0].minStock);
    });

    it('should create a product', async () => {
      const createData = {
        sku: 'PROD-003',
        name: 'New Product',
        description: 'New product description',
        unitCost: 40,
        salePrice: 80,
        quantity: 200,
        minStock: 20,
        maxStock: 1000,
        location: 'C3',
        barcode: '111222333',
        categoryId: 'cat-1',
        supplierId: 'sup-1',
      };

      const mockResponse: Product = {
        id: '3',
        ...createData,
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };

      server.use(
        http.post('http://localhost:3000/api/products', async () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await apiService.createProduct(createData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('3');
      expect(result.data.name).toBe('New Product');
    });

    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        salePrice: 120,
      };

      const mockResponse: Product = {
        id: '1',
        sku: 'PROD-001',
        name: 'Updated Product Name',
        description: 'Test description',
        unitCost: 50,
        salePrice: 120,
        quantity: 100,
        minStock: 10,
        maxStock: 500,
        isActive: true,
        categoryId: 'cat-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };

      server.use(
        http.put('http://localhost:3000/api/products/1', async () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await apiService.updateProduct('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Product Name');
      expect(result.data.salePrice).toBe(120);
    });

    it('should delete a product', async () => {
      server.use(
        http.delete('http://localhost:3000/api/products/1', () => {
          return HttpResponse.json({
            success: true,
            message: 'Product deleted successfully',
          });
        })
      );

      const result = await apiService.deleteProduct('1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 when fetching non-existent product', async () => {
      server.use(
        http.get('http://localhost:3000/api/products/999', () => {
          return HttpResponse.json(
            { success: false, error: { message: 'Product not found' } },
            { status: 404 }
          );
        })
      );

      await expect(apiService.getProduct('999')).rejects.toThrow('Product not found');
    });

    it('should handle validation errors on create', async () => {
      server.use(
        http.post('http://localhost:3000/api/products', () => {
          return HttpResponse.json(
            { success: false, error: { message: 'SKU already exists' } },
            { status: 400 }
          );
        })
      );

      await expect(
        apiService.createProduct({
          sku: 'DUPLICATE',
          name: 'Product',
          unitCost: 50,
          salePrice: 100,
          quantity: 100,
          categoryId: 'cat-1',
        })
      ).rejects.toThrow('SKU already exists');
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/products', () => {
          return HttpResponse.json(
            { success: false, error: { message: 'Internal server error' } },
            { status: 500 }
          );
        })
      );

      await expect(apiService.getProducts()).rejects.toThrow('Internal server error');
    });

    it('should handle network errors with default message', async () => {
      server.use(
        http.get('http://localhost:3000/api/products', () => {
          return HttpResponse.error();
        })
      );

      await expect(apiService.getProducts()).rejects.toThrow();
    });
  });

  describe('Health Check', () => {
    it('should check API health status', async () => {
      server.use(
        http.get('http://localhost:3000/api/health', () => {
          return HttpResponse.json({
            success: true,
            message: 'API is healthy',
          });
        })
      );

      const result = await apiService.healthCheck();

      expect(result.success).toBe(true);
      expect(result.message).toBe('API is healthy');
    });
  });
});
