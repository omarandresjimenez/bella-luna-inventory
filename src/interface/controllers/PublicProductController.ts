import { Request, Response } from 'express';
import { ProductService } from '../../application/services/ProductService';
import { productFilterSchema } from '../../application/dtos/product.dto';

const productService = new ProductService();

export class PublicProductController {
  // List products (catalog)
  async getProducts(req: Request, res: Response) {
    try {
      const filters = productFilterSchema.parse(req.query);
      const result = await productService.getProducts(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener productos',
        },
      });
    }
  }

  // Get featured products
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const products = await productService.getFeaturedProducts(limit);

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener productos destacados',
        },
      });
    }
  }

  // Get product by slug
  async getProductBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const product = await productService.getProductBySlug(slug);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener producto',
        },
      });
    }
  }

  // Get related products
  async getRelatedProducts(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const limit = parseInt(req.query.limit as string) || 4;
      const products = await productService.getRelatedProducts(id, limit);

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener productos relacionados',
        },
      });
    }
  }

  // Get brands for filter
  async getBrands(req: Request, res: Response) {
    try {
      const brands = await productService.getBrands();

      return res.status(200).json({
        success: true,
        data: brands,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener marcas',
        },
      });
    }
  }
}
