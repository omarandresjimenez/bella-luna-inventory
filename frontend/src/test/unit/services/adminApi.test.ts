import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminApi } from '../../../services/adminApi';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import type { Product, Category, Order, User, Customer, Attribute, StoreSettings } from '../../../types';

describe('adminApi', () => {
  beforeEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  describe('Products', () => {
    it('should fetch products with pagination params', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/products', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      await adminApi.getProducts({
        page: 2,
        limit: 20,
        search: 'laptop',
        isActive: true,
      });

      expect(capturedUrl).toContain('page=2');
      expect(capturedUrl).toContain('limit=20');
      expect(capturedUrl).toContain('search=laptop');
      expect(capturedUrl).toContain('isActive=true');
    });

    it('should fetch product by id', async () => {
      const mockProduct: Product = {
        id: 'prod-1',
        sku: 'PROD-001',
        name: 'Admin Product',
        slug: 'admin-product',
        baseCost: 50,
        basePrice: 100,
        discountPercent: 0,
        trackStock: true,
        stock: 100,
        isActive: true,
        isFeatured: false,
        categories: [],
        variants: [],
        images: [],
        attributes: [],
        finalPrice: 100,
      };

      server.use(
        http.get('http://localhost:3000/api/admin/products/prod-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockProduct,
          });
        })
      );

      const result = await adminApi.getProductById('prod-1');

      expect(result.data.data.id).toBe('prod-1');
      expect(result.data.data.sku).toBe('PROD-001');
    });

    it('should create a product', async () => {
      const createData = {
        sku: 'NEW-001',
        name: 'New Product',
        description: 'New description',
        brand: 'TestBrand',
        baseCost: 40,
        basePrice: 80,
        discountPercent: 10,
        trackStock: true,
        categoryIds: ['cat-1'],
        attributeIds: ['attr-1'],
        attributes: [{ attributeId: 'attr-1', value: 'test' }],
      };

      server.use(
        http.post('http://localhost:3000/api/admin/products', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(createData);
          return HttpResponse.json({
            success: true,
            data: { id: 'new-prod', ...(body as object) },
          });
        })
      );

      const result = await adminApi.createProduct(createData);

      expect(result.data.data.id).toBe('new-prod');
    });

    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        basePrice: 90,
        isActive: false,
        isFeatured: true,
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/products/prod-1', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'prod-1', ...(body as object) },
          });
        })
      );

      const result = await adminApi.updateProduct('prod-1', updateData);

      expect(result.data.data.name).toBe('Updated Product Name');
      expect(result.data.data.isActive).toBe(false);
    });

    it('should delete a product', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/products/prod-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteProduct('prod-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Product Images', () => {
    it('should upload product images', async () => {
      localStorage.setItem('token', 'admin-token');

      const mockFiles = [
        new File(['image1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      const mockResponse = {
        images: [
          {
            id: 'img-1',
            originalPath: '/uploads/img1.jpg',
            thumbnailUrl: '/thumbs/img1.jpg',
            smallUrl: '/small/img1.jpg',
            mediumUrl: '/medium/img1.jpg',
            largeUrl: '/large/img1.jpg',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      };

      server.use(
        http.post('http://localhost:3000/api/admin/products/prod-1/images', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await adminApi.uploadProductImages('prod-1', mockFiles);

      expect(result.data.images).toHaveLength(1);
    });

    it('should upload product images with variant ID', async () => {
      localStorage.setItem('token', 'admin-token');

      const mockFiles = [new File(['image'], 'test.jpg', { type: 'image/jpeg' })];

      server.use(
        http.post('http://localhost:3000/api/admin/products/prod-1/images', () => {
          return HttpResponse.json({ images: [] });
        })
      );

      const result = await adminApi.uploadProductImages('prod-1', mockFiles, 'variant-1');

      expect(result.data).toBeDefined();
    });

    it('should delete product image', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/products/prod-1/images/img-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteProductImage('prod-1', 'img-1');

      expect(result.data.success).toBe(true);
    });

    it('should set primary image', async () => {
      server.use(
        http.patch('http://localhost:3000/api/admin/products/prod-1/images/img-1/primary', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.setPrimaryImage('prod-1', 'img-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Categories', () => {
    it('should fetch all categories', async () => {
      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'Electronics',
          slug: 'electronics',
          isActive: true,
          isFeatured: false,
          sortOrder: 1,
        },
        {
          id: 'cat-2',
          name: 'Clothing',
          slug: 'clothing',
          isActive: true,
          isFeatured: true,
          sortOrder: 2,
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/admin/categories', () => {
          return HttpResponse.json({
            success: true,
            data: mockCategories,
          });
        })
      );

      const result = await adminApi.getCategories();

      expect(result.data.data).toHaveLength(2);
    });

    it('should fetch category by id', async () => {
      const mockCategory: Category = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic items',
        parentId: undefined,
        imageUrl: 'https://example.com/cat.jpg',
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
        children: [],
      };

      server.use(
        http.get('http://localhost:3000/api/admin/categories/cat-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockCategory,
          });
        })
      );

      const result = await adminApi.getCategoryById('cat-1');

      expect(result.data.data.name).toBe('Electronics');
    });

    it('should create a category', async () => {
      const createData = {
        name: 'New Category',
        slug: 'new-category',
        description: 'New category description',
        parentId: 'cat-1' as string | undefined,
        imageUrl: 'https://example.com/new.jpg',
        isFeatured: true,
        sortOrder: 5,
      };

      server.use(
        http.post('http://localhost:3000/api/admin/categories', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(createData);
          return HttpResponse.json({
            success: true,
            data: { id: 'cat-new', ...(body as object) },
          });
        })
      );

      const result = await adminApi.createCategory(createData);

      expect(result.data.data.slug).toBe('new-category');
    });

    it('should update a category', async () => {
      const updateData = {
        name: 'Updated Category',
        isActive: false,
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/categories/cat-1', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'cat-1', ...(body as object) },
          });
        })
      );

      const result = await adminApi.updateCategory('cat-1', updateData);

      expect(result.data.data.isActive).toBe(false);
    });

    it('should delete a category', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/categories/cat-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteCategory('cat-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Category Images', () => {
    it('should upload category image', async () => {
      localStorage.setItem('token', 'admin-token');

      const mockFile = new File(['image'], 'category.jpg', { type: 'image/jpeg' });

      server.use(
        http.post('http://localhost:3000/api/admin/categories/cat-1/image', () => {
          return HttpResponse.json({
            imageUrl: 'https://example.com/category-image.jpg',
          });
        })
      );

      const result = await adminApi.uploadCategoryImage('cat-1', mockFile);

      expect(result.data.imageUrl).toBe('https://example.com/category-image.jpg');
    });

    it('should delete category image', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/categories/cat-1/image', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteCategoryImage('cat-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Attributes', () => {
    it('should fetch all attributes', async () => {
      const mockAttributes: Attribute[] = [
        {
          id: 'attr-1',
          name: 'color',
          displayName: 'Color',
          type: 'COLOR_HEX',
          sortOrder: 1,
          values: [],
        },
        {
          id: 'attr-2',
          name: 'size',
          displayName: 'Size',
          type: 'TEXT',
          sortOrder: 2,
          values: [],
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/admin/attributes', () => {
          return HttpResponse.json({
            success: true,
            data: mockAttributes,
          });
        })
      );

      const result = await adminApi.getAttributes();

      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].type).toBe('COLOR_HEX');
    });

    it('should create an attribute', async () => {
      const createData = {
        name: 'material',
        displayName: 'Material',
        type: 'TEXT' as const,
        sortOrder: 3,
      };

      server.use(
        http.post('http://localhost:3000/api/admin/attributes', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(createData);
          return HttpResponse.json({
            success: true,
            data: { id: 'attr-new', ...(body as object), values: [] },
          });
        })
      );

      const result = await adminApi.createAttribute(createData);

      expect(result.data.data.name).toBe('material');
    });

    it('should update an attribute', async () => {
      const updateData = {
        displayName: 'Updated Color',
        sortOrder: 5,
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/attributes/attr-1', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'attr-1', name: 'color', type: 'COLOR_HEX', ...(body as object), values: [] },
          });
        })
      );

      const result = await adminApi.updateAttribute('attr-1', updateData);

      expect(result.data.data.displayName).toBe('Updated Color');
    });

    it('should delete an attribute', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/attributes/attr-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteAttribute('attr-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Attribute Values', () => {
    it('should add attribute value', async () => {
      const valueData = {
        value: 'Red',
        displayValue: 'Crimson Red',
        colorHex: '#FF0000',
        sortOrder: 1,
      };

      server.use(
        http.post('http://localhost:3000/api/admin/attributes/attr-1/values', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(valueData);
          return HttpResponse.json({
            success: true,
            data: { id: 'attr-1', name: 'color', values: [body] },
          });
        })
      );

      const result = await adminApi.addAttributeValue('attr-1', valueData);

      expect(result.data.success).toBe(true);
    });

    it('should remove attribute value', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/attributes/values/val-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.removeAttributeValue('val-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Orders', () => {
    it('should fetch orders with filters', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/orders', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: {
              orders: [],
              pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
            },
          });
        })
      );

      await adminApi.getOrders({
        page: 1,
        limit: 20,
        status: 'PENDING',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(capturedUrl).toContain('status=PENDING');
      expect(capturedUrl).toContain('startDate=2024-01-01');
      expect(capturedUrl).toContain('endDate=2024-01-31');
    });

    it('should fetch order by id', async () => {
      const mockOrder: Order = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'PENDING',
        total: 150,
        subtotal: 140,
        discount: 0,
        deliveryFee: 10,
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        customerId: 'cust-1',
        shippingAddress: {
          id: 'addr-1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true,
        },
        items: [],
        createdAt: '2024-01-01T00:00:00Z',
      };

      server.use(
        http.get('http://localhost:3000/api/admin/orders/order-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockOrder,
          });
        })
      );

      const result = await adminApi.getOrderById('order-1');

      expect(result.data.data.orderNumber).toBe('ORD-001');
    });

    it('should update order status', async () => {
      const updateData = {
        status: 'CONFIRMED',
        adminNotes: 'Order confirmed by admin',
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/orders/order-1/status', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'order-1', status: 'CONFIRMED' },
          });
        })
      );

      const result = await adminApi.updateOrderStatus('order-1', updateData);

      expect(result.data.data.status).toBe('CONFIRMED');
    });
  });

  describe('Store Settings', () => {
    it('should fetch store settings', async () => {
      const mockSettings: StoreSettings = {
        id: '1',
        storeName: 'Bella Luna',
        storeEmail: 'admin@bellaluna.com',
        storePhone: '+1234567890',
        storeAddress: '123 Main St',
        deliveryFee: 5.99,
        freeDeliveryThreshold: 50,
        whatsappNumber: '+1234567890',
      };

      server.use(
        http.get('http://localhost:3000/api/admin/settings', () => {
          return HttpResponse.json({
            success: true,
            data: mockSettings,
          });
        })
      );

      const result = await adminApi.getStoreSettings();

      expect(result.data.data.storeName).toBe('Bella Luna');
    });

    it('should update store settings', async () => {
      const updateData = {
        deliveryFee: 7.99,
        freeDeliveryThreshold: 75,
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/settings', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: '1', storeName: 'Bella Luna', ...(body as object) },
          });
        })
      );

      const result = await adminApi.updateStoreSettings(updateData);

      expect(result.data.data.deliveryFee).toBe(7.99);
    });
  });

  describe('Analytics', () => {
    it('should fetch dashboard stats with period', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/analytics/dashboard', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: {
              totalOrders: 100,
              totalRevenue: 10000,
              avgOrderValue: 100,
              ordersByStatus: [],
              lowStockProducts: [],
              outOfStockCount: 0,
            },
          });
        })
      );

      await adminApi.getDashboardStats('last30days');

      expect(capturedUrl).toContain('period=last30days');
    });

    it('should fetch dashboard stats without period', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/analytics/dashboard', () => {
          return HttpResponse.json({
            success: true,
            data: {
              totalOrders: 50,
              totalRevenue: 5000,
              avgOrderValue: 100,
              ordersByStatus: [{ status: 'PENDING', _count: 10 }],
              lowStockProducts: [],
              outOfStockCount: 2,
            },
          });
        })
      );

      const result = await adminApi.getDashboardStats();

      expect(result.data.data.totalOrders).toBe(50);
    });

    it('should fetch sales over time', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/analytics/sales-over-time', () => {
          return HttpResponse.json({
            success: true,
            data: [
              { date: '2024-01-01', sales: 1000, orders: 10 },
              { date: '2024-01-02', sales: 1500, orders: 15 },
            ],
          });
        })
      );

      const result = await adminApi.getSalesOverTime('week');

      expect(result.data.data).toHaveLength(2);
    });

    it('should fetch top products', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/analytics/top-products', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: [
              { name: 'Product A', quantity: 50, revenue: 5000 },
              { name: 'Product B', quantity: 30, revenue: 3000 },
            ],
          });
        })
      );

      await adminApi.getTopProducts({ limit: 5, period: 'month' });

      expect(capturedUrl).toContain('limit=5');
      expect(capturedUrl).toContain('period=month');
    });

    it('should fetch sales by category', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/analytics/sales-by-category', () => {
          return HttpResponse.json({
            success: true,
            data: [
              { name: 'Electronics', revenue: 5000, quantity: 50 },
              { name: 'Clothing', revenue: 3000, quantity: 100 },
            ],
          });
        })
      );

      const result = await adminApi.getSalesByCategory('year');

      expect(result.data.data).toHaveLength(2);
    });
  });

  describe('Product Attributes', () => {
    it('should update product attributes', async () => {
      const attributes = [
        { attributeId: 'attr-1', value: 'Red' },
        { attributeId: 'attr-2', value: 'Large' },
      ];

      server.use(
        http.patch('http://localhost:3000/api/admin/products/prod-1/attributes', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ attributes });
          return HttpResponse.json({
            success: true,
            data: { id: 'prod-1', attributes },
          });
        })
      );

      const result = await adminApi.updateProductAttributes('prod-1', attributes);

      expect(result.data.success).toBe(true);
    });
  });

  describe('Variants', () => {
    it('should fetch product variants', async () => {
      const mockVariants = [
        {
          id: 'var-1',
          productId: 'prod-1',
          variantSku: 'PROD-001-RED-L',
          price: 110,
          stock: 50,
          isActive: true,
          attributeValues: [],
          images: [],
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/admin/products/prod-1/variants', () => {
          return HttpResponse.json({
            success: true,
            data: mockVariants,
          });
        })
      );

      const result = await adminApi.getProductVariants('prod-1');

      expect(result.data.data).toHaveLength(1);
    });

    it('should create a variant', async () => {
      const variantData = {
        variantSku: 'PROD-001-BLUE-M',
        cost: 40,
        price: 90,
        stock: 100,
        isActive: true,
        attributeValueIds: ['val-1', 'val-2'],
      };

      server.use(
        http.post('http://localhost:3000/api/admin/products/prod-1/variants', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(variantData);
          return HttpResponse.json({
            success: true,
            data: { id: 'var-new', productId: 'prod-1', ...(body as object), attributeValues: [] },
          });
        })
      );

      const result = await adminApi.createVariant('prod-1', variantData);

      expect(result.data.data.variantSku).toBe('PROD-001-BLUE-M');
    });

    it('should update a variant', async () => {
      const updateData = {
        stock: 75,
        price: 95,
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/variants/var-1', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'var-1', productId: 'prod-1', ...(body as object) },
          });
        })
      );

      const result = await adminApi.updateVariant('var-1', updateData);

      expect(result.data.data.stock).toBe(75);
    });

    it('should delete a variant', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/variants/var-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteVariant('var-1');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Users', () => {
    it('should fetch users with filters', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/users', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: {
              data: [],
              pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
            },
          });
        })
      );

      await adminApi.getUsers({
        page: 1,
        limit: 20,
        search: 'john',
        role: 'ADMIN',
        isActive: true,
      });

      expect(capturedUrl).toContain('search=john');
      expect(capturedUrl).toContain('role=ADMIN');
      expect(capturedUrl).toContain('isActive=true');
    });

    it('should fetch user by id', async () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      };

      server.use(
        http.get('http://localhost:3000/api/admin/users/user-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockUser,
          });
        })
      );

      const result = await adminApi.getUserById('user-1');

      expect(result.data.data.role).toBe('ADMIN');
    });

    it('should create a user', async () => {
      const createData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'MANAGER' as const,
        isActive: true,
      };

      server.use(
        http.post('http://localhost:3000/api/admin/users', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(createData);
          return HttpResponse.json({
            success: true,
            data: { id: 'user-new', ...(body as object) },
          });
        })
      );

      const result = await adminApi.createUser(createData);

      expect(result.data.data.email).toBe('newuser@example.com');
    });

    it('should update a user', async () => {
      const updateData = {
        firstName: 'Updated',
        role: 'EMPLOYEE' as const,
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/users/user-1', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'user-1', ...(body as object) },
          });
        })
      );

      const result = await adminApi.updateUser('user-1', updateData);

      expect(result.data.data.role).toBe('EMPLOYEE');
    });

    it('should delete a user', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/users/user-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteUser('user-1');

      expect(result.data.success).toBe(true);
    });

    it('should toggle user status', async () => {
      server.use(
        http.patch('http://localhost:3000/api/admin/users/user-1/toggle-status', () => {
          return HttpResponse.json({
            success: true,
            data: { id: 'user-1', isActive: false },
          });
        })
      );

      const result = await adminApi.toggleUserStatus('user-1');

      expect(result.data.data.isActive).toBe(false);
    });

    it('should fetch users stats', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/users/stats', () => {
          return HttpResponse.json({
            success: true,
            data: [
              { role: 'ADMIN', count: 2 },
              { role: 'MANAGER', count: 5 },
              { role: 'EMPLOYEE', count: 10 },
            ],
          });
        })
      );

      const result = await adminApi.getUsersStats();

      expect(result.data.data).toHaveLength(3);
    });
  });

  describe('Customers', () => {
    it('should fetch customers with filters', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/customers', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: {
              data: [],
              pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
            },
          });
        })
      );

      await adminApi.getCustomers({
        page: 1,
        limit: 20,
        search: 'john',
        isVerified: true,
        hasOrders: true,
      });

      expect(capturedUrl).toContain('search=john');
      expect(capturedUrl).toContain('isVerified=true');
      expect(capturedUrl).toContain('hasOrders=true');
    });

    it('should fetch customer by id', async () => {
      const mockCustomer = {
        id: 'cust-1',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        isVerified: true,
        orderCount: 5,
        addressesCount: 2,
        totalSpent: 500,
        addresses: [],
        recentOrders: [],
      };

      server.use(
        http.get('http://localhost:3000/api/admin/customers/cust-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockCustomer,
          });
        })
      );

      const result = await adminApi.getCustomerById('cust-1');

      expect(result.data.data.orderCount).toBe(5);
    });

    it('should create a customer', async () => {
      const createData = {
        email: 'newcustomer@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Customer',
        phone: '1234567890',
        birthDate: '1990-01-01',
        isVerified: false,
      };

      server.use(
        http.post('http://localhost:3000/api/admin/customers', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body).toEqual(createData);
          return HttpResponse.json({
            success: true,
            data: { id: 'cust-new', ...(body as object) },
          });
        })
      );

      const result = await adminApi.createCustomer(createData);

      expect(result.data.data.email).toBe('newcustomer@example.com');
    });

    it('should update a customer', async () => {
      const updateData = {
        firstName: 'Updated',
        phone: '0987654321',
      };

      server.use(
        http.patch('http://localhost:3000/api/admin/customers/cust-1', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: { id: 'cust-1', ...updateData },
          });
        })
      );

      const result = await adminApi.updateCustomer('cust-1', updateData);

      expect(result.data.data.phone).toBe('0987654321');
    });

    it('should delete a customer', async () => {
      server.use(
        http.delete('http://localhost:3000/api/admin/customers/cust-1', () => {
          return HttpResponse.json({
            success: true,
            data: {},
          });
        })
      );

      const result = await adminApi.deleteCustomer('cust-1');

      expect(result.data.success).toBe(true);
    });

    it('should toggle customer verification', async () => {
      server.use(
        http.patch('http://localhost:3000/api/admin/customers/cust-1/toggle-verification', () => {
          return HttpResponse.json({
            success: true,
            data: { id: 'cust-1', isVerified: true },
          });
        })
      );

      const result = await adminApi.toggleCustomerVerification('cust-1');

      expect(result.data.data.isVerified).toBe(true);
    });

    it('should fetch customers stats', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/customers/stats', () => {
          return HttpResponse.json({
            success: true,
            data: {
              total: 100,
              verified: 80,
              unverified: 20,
              withOrders: 60,
              totalRevenue: 50000,
            },
          });
        })
      );

      const result = await adminApi.getCustomersStats();

      expect(result.data.data.total).toBe(100);
      expect(result.data.data.verified).toBe(80);
    });

    it('should fetch recent customers', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/admin/customers/recent', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      await adminApi.getRecentCustomers(10);

      expect(capturedUrl).toContain('limit=10');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 when fetching non-existent product', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/products/999', () => {
          return HttpResponse.json(
            { success: false, message: 'Product not found' },
            { status: 404 }
          );
        })
      );

      await expect(adminApi.getProductById('999')).rejects.toThrow();
    });

    it('should handle 403 forbidden for non-admin', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/users', () => {
          return HttpResponse.json(
            { success: false, message: 'Forbidden' },
            { status: 403 }
          );
        })
      );

      await expect(adminApi.getUsers()).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post('http://localhost:3000/api/admin/products', () => {
          return HttpResponse.json(
            { success: false, message: 'Validation failed', details: { sku: 'Already exists' } },
            { status: 400 }
          );
        })
      );

      await expect(
        adminApi.createProduct({
          sku: 'DUPLICATE',
          name: 'Product',
          baseCost: 50,
          basePrice: 100,
          categoryIds: ['cat-1'],
        })
      ).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/admin/orders', () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(adminApi.getOrders()).rejects.toThrow();
    });
  });
});
