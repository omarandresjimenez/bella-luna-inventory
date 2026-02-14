import { describe, it, expect, beforeEach } from '@jest/globals';
import { PublicProductController } from '../../../interface/controllers/PublicProductController';
import { ProductService } from '../../../application/services/ProductService';
import { createMockRequest, createMockResponse, TestDataBuilder } from '../../test-utils';
import { HttpStatus } from '../../../shared/utils/api-response';

describe('PublicProductController', () => {
  let controller: PublicProductController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(() => {
    productService = {
      getProducts: jest.fn(),
      getProductById: jest.fn(),
      getProductBySlug: jest.fn(),
      getFeaturedProducts: jest.fn(),
      getLowStockProducts: jest.fn(),
      getRelatedProducts: jest.fn(),
      getBrands: jest.fn(),
    } as any;

    controller = new PublicProductController(productService);
  });

  describe('getProducts', () => {
    it('should return products with 200 status', async () => {
      const mockProducts = [
        TestDataBuilder.aProduct({ id: 'prod-1' }),
        TestDataBuilder.aProduct({ id: 'prod-2' }),
      ];

      productService.getProducts.mockResolvedValueOnce({
        products: mockProducts,
        pagination: { total: 2, page: 1, limit: 24, pages: 1 },
      });

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.getProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });

    it('should handle service errors with 500 status', async () => {
      const error = new Error('Database error');
      productService.getProducts.mockRejectedValueOnce(error);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.getProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should pass filters to service', async () => {
      productService.getProducts.mockResolvedValueOnce({
        products: [],
        pagination: { total: 0, page: 1, limit: 24, pages: 0 },
      });

      const req = createMockRequest({
        query: {
          category: 'electronics',
          minPrice: '50',
          maxPrice: '200',
          search: 'laptop',
        },
      });
      const res = createMockResponse();

      await controller.getProducts(req as any, res as any);

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'electronics',
          search: 'laptop',
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should return product by id with 200 status', async () => {
      const mockProduct = TestDataBuilder.aProduct({ id: 'prod-1' });
      productService.getProductById.mockResolvedValueOnce(mockProduct as any);

      const req = createMockRequest({ params: { id: 'prod-1' } });
      const res = createMockResponse();

      await controller.getProductById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProduct,
        })
      );
    });

    it('should return 404 if product not found', async () => {
      productService.getProductById.mockResolvedValueOnce(null as any);

      const req = createMockRequest({ params: { id: 'nonexistent' } });
      const res = createMockResponse();

      await controller.getProductById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = TestDataBuilder.aProduct({ slug: 'test-product' });
      productService.getProductBySlug.mockResolvedValueOnce(mockProduct as any);

      const req = createMockRequest({ params: { slug: 'test-product' } });
      const res = createMockResponse();

      await controller.getProductBySlug(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle slug not found error', async () => {
      productService.getProductBySlug.mockRejectedValueOnce(
        new Error('Product not found')
      );

      const req = createMockRequest({ params: { slug: 'nonexistent' } });
      const res = createMockResponse();

      await controller.getProductBySlug(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        TestDataBuilder.aProduct({ isFeatured: true }),
        TestDataBuilder.aProduct({ isFeatured: true }),
      ];

      productService.getFeaturedProducts.mockResolvedValueOnce(mockProducts as any);

      const req = createMockRequest({
        query: { limit: '6' },
      });
      const res = createMockResponse();

      await controller.getFeaturedProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(productService.getFeaturedProducts).toHaveBeenCalledWith(6);
    });
  });

  describe('getRelatedProducts', () => {
    it('should return related products', async () => {
      const mockRelated = [
        TestDataBuilder.aProduct({ categoryId: 'cat-1' }),
      ];

      productService.getRelatedProducts.mockResolvedValueOnce(mockRelated as any);

      const req = createMockRequest({
        params: { id: 'prod-1' },
        query: { limit: '5' },
      });
      const res = createMockResponse();

      await controller.getRelatedProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('getBrands', () => {
    it('should return unique brands list', async () => {
      const mockBrands = ['Apple', 'Samsung', 'Sony'];
      productService.getBrands.mockResolvedValueOnce(mockBrands);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.getBrands(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockBrands,
        })
      );
    });
  });
});
