import { describe, it, expect, beforeEach } from 'vitest';
import { publicApi } from '../../../services/publicApi';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import type { Category, Product, StoreSettings } from '../../../types';

describe('publicApi', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Categories', () => {
    it('should fetch all categories', async () => {
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic devices and accessories',
          isActive: true,
          isFeatured: true,
          sortOrder: 1,
          imageUrl: 'https://example.com/electronics.jpg',
        },
        {
          id: '2',
          name: 'Clothing',
          slug: 'clothing',
          description: 'Apparel and accessories',
          isActive: true,
          isFeatured: false,
          sortOrder: 2,
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/categories', () => {
          return HttpResponse.json({
            success: true,
            data: mockCategories,
          });
        })
      );

      const result = await publicApi.getCategories();

      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].name).toBe('Electronics');
      expect(result.data.data[1].slug).toBe('clothing');
    });

    it('should fetch category by slug', async () => {
      const mockCategory: Category = {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices',
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
        children: [
          {
            id: '1-1',
            name: 'Phones',
            slug: 'phones',
            isActive: true,
            isFeatured: false,
            sortOrder: 1,
          },
        ],
      };

      server.use(
        http.get('http://localhost:3000/api/categories/electronics', () => {
          return HttpResponse.json({
            success: true,
            data: mockCategory,
          });
        })
      );

      const result = await publicApi.getCategoryBySlug('electronics');

      expect(result.data.data.slug).toBe('electronics');
      expect(result.data.data.children).toHaveLength(1);
    });

    it('should handle category not found', async () => {
      server.use(
        http.get('http://localhost:3000/api/categories/non-existent', () => {
          return HttpResponse.json(
            { success: false, message: 'Category not found' },
            { status: 404 }
          );
        })
      );

      await expect(publicApi.getCategoryBySlug('non-existent')).rejects.toThrow();
    });
  });

  describe('Products', () => {
    it('should fetch all products', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'PROD-001',
          name: 'Laptop',
          slug: 'laptop',
          description: 'High-performance laptop',
          brand: 'TechBrand',
          baseCost: 800,
          basePrice: 1200,
          discountPercent: 10,
          trackStock: true,
          stock: 50,
          isActive: true,
          isFeatured: true,
          categories: [],
          variants: [],
          images: [],
          attributes: [],
          finalPrice: 1080,
        },
        {
          id: '2',
          sku: 'PROD-002',
          name: 'Phone',
          slug: 'phone',
          baseCost: 400,
          basePrice: 800,
          discountPercent: 0,
          trackStock: true,
          stock: 100,
          isActive: true,
          isFeatured: false,
          categories: [],
          variants: [],
          images: [],
          attributes: [],
          finalPrice: 800,
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

      const result = await publicApi.getProducts();

      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].name).toBe('Laptop');
    });

    it('should fetch products with filters', async () => {
      let capturedUrl: string = '';

      server.use(
        http.get('http://localhost:3000/api/products', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      await publicApi.getProducts({
        page: 1,
        limit: 20,
        category: 'electronics',
        search: 'laptop',
        minPrice: 500,
        maxPrice: 2000,
        brand: 'TechBrand',
        isFeatured: true,
        sortBy: 'price',
        sortOrder: 'desc',
      });

      expect(capturedUrl).toContain('page=1');
      expect(capturedUrl).toContain('limit=20');
      expect(capturedUrl).toContain('category=electronics');
      expect(capturedUrl).toContain('search=laptop');
      expect(capturedUrl).toContain('minPrice=500');
      expect(capturedUrl).toContain('maxPrice=2000');
      expect(capturedUrl).toContain('brand=TechBrand');
      expect(capturedUrl).toContain('isFeatured=true');
      expect(capturedUrl).toContain('sortBy=price');
      expect(capturedUrl).toContain('sortOrder=desc');
    });

    it('should fetch featured products', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'FEAT-001',
          name: 'Featured Product',
          slug: 'featured-product',
          baseCost: 50,
          basePrice: 100,
          discountPercent: 0,
          trackStock: true,
          stock: 10,
          isActive: true,
          isFeatured: true,
          categories: [],
          variants: [],
          images: [],
          attributes: [],
          finalPrice: 100,
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/products/featured', () => {
          return HttpResponse.json({
            success: true,
            data: mockProducts,
          });
        })
      );

      const result = await publicApi.getFeaturedProducts();

      expect(result.data.data[0].isFeatured).toBe(true);
    });

    it('should fetch product by slug', async () => {
      const mockProduct: Product = {
        id: '1',
        sku: 'PROD-001',
        name: 'Laptop',
        slug: 'gaming-laptop',
        description: 'Gaming laptop with high specs',
        baseCost: 1000,
        basePrice: 1500,
        discountPercent: 5,
        trackStock: true,
        stock: 25,
        isActive: true,
        isFeatured: true,
        categories: [],
        variants: [
          {
            id: 'var-1',
            productId: '1',
            variantSku: 'PROD-001-16GB',
            price: 1600,
            stock: 10,
            isActive: true,
            attributeValues: [],
            images: [],
          },
        ],
        images: [],
        attributes: [],
        finalPrice: 1425,
      };

      server.use(
        http.get('http://localhost:3000/api/products/gaming-laptop', () => {
          return HttpResponse.json({
            success: true,
            data: mockProduct,
          });
        })
      );

      const result = await publicApi.getProductBySlug('gaming-laptop');

      expect(result.data.data.slug).toBe('gaming-laptop');
      expect(result.data.data.variants).toHaveLength(1);
    });

    it('should fetch product by id', async () => {
      const mockProduct: Product = {
        id: 'prod-123',
        sku: 'PROD-123',
        name: 'Product by ID',
        slug: 'product-by-id',
        baseCost: 25,
        basePrice: 50,
        discountPercent: 0,
        trackStock: true,
        stock: 100,
        isActive: true,
        isFeatured: false,
        categories: [],
        variants: [],
        images: [],
        attributes: [],
        finalPrice: 50,
      };

      server.use(
        http.get('http://localhost:3000/api/products/by-id/prod-123', () => {
          return HttpResponse.json({
            success: true,
            data: mockProduct,
          });
        })
      );

      const result = await publicApi.getProductById('prod-123');

      expect(result.data.data.id).toBe('prod-123');
    });

    it('should fetch products by category', async () => {
      let capturedUrl: string = '';

      server.use(
        http.get('http://localhost:3000/api/products', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      await publicApi.getProductsByCategory('electronics', {
        page: 2,
        limit: 10,
        minPrice: 100,
      });

      expect(capturedUrl).toContain('category=electronics');
      expect(capturedUrl).toContain('page=2');
      expect(capturedUrl).toContain('limit=10');
      expect(capturedUrl).toContain('minPrice=100');
    });
  });

  describe('Store Settings', () => {
    it('should fetch store settings', async () => {
      const mockSettings: StoreSettings = {
        id: '1',
        storeName: 'Bella Luna',
        storeEmail: 'contact@bellaluna.com',
        storePhone: '+1234567890',
        storeAddress: '123 Main St, City',
        deliveryFee: 5.99,
        freeDeliveryThreshold: 50,
        whatsappNumber: '+1234567890',
      };

      server.use(
        http.get('http://localhost:3000/api/store/settings', () => {
          return HttpResponse.json({
            success: true,
            data: mockSettings,
          });
        })
      );

      const result = await publicApi.getStoreSettings();

      expect(result.data.data.storeName).toBe('Bella Luna');
      expect(result.data.data.deliveryFee).toBe(5.99);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/products', () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      await expect(publicApi.getProducts()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/categories', () => {
          return HttpResponse.error();
        })
      );

      await expect(publicApi.getCategories()).rejects.toThrow();
    });
  });
});
