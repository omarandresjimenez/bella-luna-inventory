import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { PublicProductController } from '../controllers/PublicProductController';
import { PublicCategoryController } from '../controllers/PublicCategoryController';
import { StoreController } from '../controllers/StoreController';
import { ProductService } from '../../application/services/ProductService';
import { CategoryService } from '../../application/services/CategoryService';
import { StoreService } from '../../application/services/StoreService';

const router = Router();
const productService = new ProductService(prisma);
const categoryService = new CategoryService(prisma);
const storeService = new StoreService(prisma);
const productController = new PublicProductController(productService);
const categoryController = new PublicCategoryController(categoryService);
const storeController = new StoreController(storeService);

// Store settings
router.get('/store/settings', storeController.getSettings.bind(storeController));

// Products (public catalog)
router.get('/products', productController.getProducts.bind(productController));
router.get('/products/featured', productController.getFeaturedProducts.bind(productController));
router.get('/products/brands', productController.getBrands.bind(productController));
router.get('/products/:slug', productController.getProductBySlug.bind(productController));
router.get('/products/:id/related', productController.getRelatedProducts.bind(productController));

// Categories
router.get('/categories', categoryController.getCategories.bind(categoryController));
router.get('/categories/featured', categoryController.getFeaturedCategories.bind(categoryController));
router.get('/categories/:slug', categoryController.getCategoryBySlug.bind(categoryController));

export default router;
