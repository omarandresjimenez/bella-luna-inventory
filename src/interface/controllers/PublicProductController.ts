import { Request, Response } from 'express';
import { ProductService } from '../../application/services/ProductService.js';
import { productFilterSchema } from '../../application/dtos/product.dto.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';

export class PublicProductController {
  constructor(private productService: ProductService) {}

  // List products (catalog)
  async getProducts(req: Request, res: Response) {
    try {
      const filters = productFilterSchema.parse(req.query);
      const result = await this.productService.getProducts(filters);
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener productos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get featured products
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const products = await this.productService.getFeaturedProducts(limit);
      sendSuccess(res, products);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener productos destacados', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get product by slug
  async getProductBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const product = await this.productService.getProductBySlug(slug);
      sendSuccess(res, product);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Producto no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener producto', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await this.productService.getProductById(id);
      sendSuccess(res, product);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Producto no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener producto', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get related products
  async getRelatedProducts(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const limit = parseInt(req.query.limit as string) || 4;
      const products = await this.productService.getRelatedProducts(id, limit);
      sendSuccess(res, products);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener productos relacionados', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get brands for filter
  async getBrands(req: Request, res: Response) {
    try {
      const brands = await this.productService.getBrands();
      sendSuccess(res, brands);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener marcas', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

