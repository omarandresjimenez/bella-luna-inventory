import { describe, it, expect, beforeEach } from '@jest/globals';
import { AdminProductController } from '../../../interface/controllers/AdminProductController.js';
import { createMockRequest, createMockResponse } from '../../test-utils.js';
import { HttpStatus } from '../../../shared/utils/api-response.js';

describe('AdminProductController', () => {
  let controller: AdminProductController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      product: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      productImage: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      productVariant: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    controller = new AdminProductController(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create product successfully with all fields', async () => {
      const productData = {
        sku: 'PROD-001',
        name: 'Test Product',
        description: 'A test product',
        brand: 'Test Brand',
        slug: 'test-product',
        baseCost: 50.00,
        basePrice: 99.99,
        discountPercent: 10,
        trackStock: true,
        stock: 100,
        isActive: true,
        isFeatured: true,
        categoryIds: ['cat-1', 'cat-2'],
        attributes: [
          { attributeId: 'attr-1', value: 'Red' },
        ],
      };

      const mockProduct = {
        id: 'prod-1',
        ...productData,
        baseCost: 50.00,
        basePrice: 99.99,
        discountPercent: 10,
        categories: [],
        variants: [],
        images: [],
        attributes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = createMockRequest({
        body: productData,
      });
      const res = createMockResponse();
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      await controller.createProduct(req, res);

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sku: 'PROD-001',
            name: 'Test Product',
            basePrice: 99.99,
            baseCost: 50.00,
          }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'prod-1',
            name: 'Test Product',
          }),
        })
      );
    });

    it('should validate required fields', async () => {
      const req = createMockRequest({
        body: {
          name: 'Test Product',
          // Missing required fields: sku, slug, basePrice
        },
      });
      const res = createMockResponse();

      await controller.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should validate price constraints', async () => {
      const req = createMockRequest({
        body: {
          sku: 'PROD-001',
          name: 'Test Product',
          slug: 'test-product',
          basePrice: -10, // Invalid negative price
          baseCost: 50.00,
        },
      });
      const res = createMockResponse();

      await controller.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should validate SKU format', async () => {
      const req = createMockRequest({
        body: {
          sku: '', // Empty SKU
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 99.99,
          baseCost: 50.00,
        },
      });
      const res = createMockResponse();

      await controller.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should validate slug format', async () => {
      const req = createMockRequest({
        body: {
          sku: 'PROD-001',
          name: 'Test Product',
          slug: 'INVALID SLUG', // Slug should be lowercase with hyphens
          basePrice: 99.99,
          baseCost: 50.00,
        },
      });
      const res = createMockResponse();

      await controller.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle decimal price conversion', async () => {
      const productData = {
        sku: 'PROD-001',
        name: 'Decimal Product',
        slug: 'decimal-product',
        basePrice: 19.99,
        baseCost: 9.99,
        discountPercent: 15,
      };

      const mockProduct = {
        id: 'prod-1',
        ...productData,
        stock: 0,
        trackStock: false,
        isActive: true,
        isFeatured: false,
        categories: [],
        variants: [],
        images: [],
        attributes: [],
      };

      const req = createMockRequest({
        body: productData,
      });
      const res = createMockResponse();
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      await controller.createProduct(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            basePrice: 19.99,
            baseCost: 9.99,
          }),
        })
      );
    });

    it('should handle optional fields', async () => {
      const productData = {
        sku: 'PROD-001',
        name: 'Simple Product',
        slug: 'simple-product',
        basePrice: 99.99,
        // Optional fields omitted: description, brand, discountPercent, etc.
      };

      const mockProduct = {
        id: 'prod-1',
        ...productData,
        description: null,
        brand: null,
        stock: 0,
        trackStock: false,
        isActive: true,
        isFeatured: false,
        discountPercent: 0,
        categories: [],
        variants: [],
        images: [],
        attributes: [],
      };

      const req = createMockRequest({
        body: productData,
      });
      const res = createMockResponse();
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      await controller.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should create product with categories', async () => {
      const productData = {
        sku: 'PROD-001',
        name: 'Categorized Product',
        slug: 'categorized-product',
        basePrice: 99.99,
        baseCost: 50.00,
        categoryIds: ['cat-1', 'cat-2', 'cat-3'],
      };

      const mockProduct = {
        id: 'prod-1',
        ...productData,
        categories: [
          { id: 'link-1', categoryId: 'cat-1' },
          { id: 'link-2', categoryId: 'cat-2' },
          { id: 'link-3', categoryId: 'cat-3' },
        ],
        variants: [],
        images: [],
        attributes: [],
      };

      const req = createMockRequest({
        body: productData,
      });
      const res = createMockResponse();
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      await controller.createProduct(req, res);

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            categories: {
              create: expect.arrayContaining([
                expect.objectContaining({ category: { connect: { id: 'cat-1' } } }),
              ]),
            },
          }),
        })
      );
    });

    it('should handle service errors during creation', async () => {
      const req = createMockRequest({
        body: {
          sku: 'PROD-001',
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 99.99,
          baseCost: 50.00,
        },
      });
      const res = createMockResponse();
      mockPrisma.product.create.mockRejectedValue(new Error('Database error'));

      await controller.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        basePrice: 119.99,
        discountPercent: 15,
      };

      const mockUpdatedProduct = {
        id: 'prod-1',
        sku: 'PROD-001',
        name: 'Updated Product',
        slug: 'test-product',
        basePrice: 119.99,
        baseCost: 50.00,
        discountPercent: 15,
        categories: [],
        variants: [],
        images: [],
        attributes: [],
      };

      const req = createMockRequest({
        params: { id: 'prod-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockPrisma.product.update.mockResolvedValue(mockUpdatedProduct);

      await controller.updateProduct(req, res);

      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: expect.objectContaining(updateData),
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedProduct,
        })
      );
    });

    it('should handle partial updates', async () => {
      const updateData = {
        name: 'Only Name Updated',
      };

      const mockUpdatedProduct = {
        id: 'prod-1',
        name: 'Only Name Updated',
        sku: 'PROD-001',
        slug: 'test-product',
        basePrice: 99.99,
      };

      const req = createMockRequest({
        params: { id: 'prod-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockPrisma.product.update.mockResolvedValue(mockUpdatedProduct);

      await controller.updateProduct(req, res);

      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: expect.objectContaining({ name: 'Only Name Updated' }),
        })
      );
    });

    it('should validate price on update', async () => {
      const req = createMockRequest({
        params: { id: 'prod-1' },
        body: {
          basePrice: -50, // Invalid negative price
        },
      });
      const res = createMockResponse();

      await controller.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should update product categories', async () => {
      const updateData = {
        categoryIds: ['cat-1', 'cat-4', 'cat-5'],
      };

      const mockUpdatedProduct = {
        id: 'prod-1',
        name: 'Test Product',
        categories: [
          { id: 'link-1', categoryId: 'cat-1' },
          { id: 'link-2', categoryId: 'cat-4' },
          { id: 'link-3', categoryId: 'cat-5' },
        ],
      };

      const req = createMockRequest({
        params: { id: 'prod-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockPrisma.product.update.mockResolvedValue(mockUpdatedProduct);

      await controller.updateProduct(req, res);

      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: expect.objectContaining({
            categories: {
              deleteMany: {},
              create: expect.any(Array),
            },
          }),
        })
      );
    });

    it('should handle product not found error', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();
      mockPrisma.product.update.mockRejectedValue(
        new Error('Product not found')
      );

      await controller.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should handle database errors during update', async () => {
      const req = createMockRequest({
        params: { id: 'prod-1' },
        body: { name: 'Updated Product' },
      });
      const res = createMockResponse();
      mockPrisma.product.update.mockRejectedValue(new Error('Database error'));

      await controller.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should activate/deactivate product', async () => {
      const updateData = {
        isActive: false,
      };

      const mockUpdatedProduct = {
        id: 'prod-1',
        name: 'Test Product',
        isActive: false,
      };

      const req = createMockRequest({
        params: { id: 'prod-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockPrisma.product.update.mockResolvedValue(mockUpdatedProduct);

      await controller.updateProduct(req, res);

      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: { isActive: false },
        })
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockDeletedProduct = {
        id: 'prod-1',
        name: 'Deleted Product',
      };

      const req = createMockRequest({
        params: { id: 'prod-1' },
      });
      const res = createMockResponse();
      mockPrisma.product.delete.mockResolvedValue(mockDeletedProduct);

      await controller.deleteProduct(req, res);

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDeletedProduct,
        })
      );
    });

    it('should return 404 when deleting non-existent product', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();
      mockPrisma.product.delete.mockRejectedValue(new Error('Product not found'));

      await controller.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should cascade delete related data', async () => {
      const mockDeletedProduct = {
        id: 'prod-1',
        name: 'Deleted Product',
        variants: [],
        images: [],
        categories: [],
      };

      const req = createMockRequest({
        params: { id: 'prod-1' },
      });
      const res = createMockResponse();
      mockPrisma.product.delete.mockResolvedValue(mockDeletedProduct);

      await controller.deleteProduct(req, res);

      expect(mockPrisma.product.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
        })
      );
    });

    it('should handle database errors during deletion', async () => {
      const req = createMockRequest({
        params: { id: 'prod-1' },
      });
      const res = createMockResponse();
      mockPrisma.product.delete.mockRejectedValue(new Error('Database error'));

      await controller.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('createVariant', () => {
    it('should create product variant successfully', async () => {
      const variantData = {
        sku: 'VARIANT-001',
        price: 99.99,
        cost: 50.00,
        stock: 50,
        images: [],
        attributeValueIds: ['attrval-1', 'attrval-2'],
      };

      const mockVariant = {
        id: 'var-1',
        productId: 'prod-1',
        ...variantData,
        attributeValues: [],
        images: [],
      };

      const req = createMockRequest({
        params: { productId: 'prod-1' },
        body: variantData,
      });
      const res = createMockResponse();
      mockPrisma.productVariant.create.mockResolvedValue(mockVariant);

      await controller.createVariant(req, res);

      expect(mockPrisma.productVariant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            productId: 'prod-1',
            sku: 'VARIANT-001',
            price: 99.99,
          }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should validate variant price constraints', async () => {
      const req = createMockRequest({
        params: { productId: 'prod-1' },
        body: {
          sku: 'VARIANT-001',
          price: -50, // Invalid negative price
          cost: 25.00,
        },
      });
      const res = createMockResponse();

      await controller.createVariant(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle duplicate SKU in variant', async () => {
      const req = createMockRequest({
        params: { productId: 'prod-1' },
        body: {
          sku: 'DUPLICATE-SKU',
          price: 99.99,
          cost: 50.00,
        },
      });
      const res = createMockResponse();
      mockPrisma.productVariant.create.mockRejectedValue(
        new Error('SKU already exists')
      );

      await controller.createVariant(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete product lifecycle', async () => {
      // Create product
      const createData = {
        sku: 'PROD-001',
        name: 'Lifecycle Product',
        slug: 'lifecycle-product',
        basePrice: 99.99,
        baseCost: 50.00,
      };

      const mockCreatedProduct = {
        id: 'prod-1',
        ...createData,
        categories: [],
        variants: [],
        images: [],
      };

      let req = createMockRequest({
        body: createData,
      });
      let res = createMockResponse();
      mockPrisma.product.create.mockResolvedValue(mockCreatedProduct);

      await controller.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);

      // Update product
      jest.clearAllMocks();
      const updateData = {
        name: 'Updated Lifecycle Product',
        basePrice: 119.99,
      };

      const mockUpdatedProduct = {
        ...mockCreatedProduct,
        ...updateData,
      };

      req = createMockRequest({
        params: { id: 'prod-1' },
        body: updateData,
      });
      res = createMockResponse();
      mockPrisma.product.update.mockResolvedValue(mockUpdatedProduct);

      await controller.updateProduct(req, res);
      expect(res.json).toHaveBeenCalled();

      // Delete product
      jest.clearAllMocks();
      req = createMockRequest({
        params: { id: 'prod-1' },
      });
      res = createMockResponse();
      mockPrisma.product.delete.mockResolvedValue(mockCreatedProduct);

      await controller.deleteProduct(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle variant management with products', async () => {
      // Create variant
      const variantData = {
        sku: 'VARIANT-001',
        price: 99.99,
        cost: 50.00,
        stock: 50,
      };

      const mockVariant = {
        id: 'var-1',
        productId: 'prod-1',
        ...variantData,
      };

      let req = createMockRequest({
        params: { productId: 'prod-1' },
        body: variantData,
      });
      let res = createMockResponse();
      mockPrisma.productVariant.create.mockResolvedValue(mockVariant);

      await controller.createVariant(req, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });
});
