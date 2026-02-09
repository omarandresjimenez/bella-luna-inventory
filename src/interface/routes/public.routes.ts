import { Router } from 'express';
import { PublicProductController } from '../controllers/PublicProductController';
import { PublicCategoryController } from '../controllers/PublicCategoryController';
import { StoreController } from '../controllers/StoreController';

const router = Router();
const productController = new PublicProductController();
const categoryController = new PublicCategoryController();
const storeController = new StoreController();

// Store settings
router.get('/store/settings', storeController.getSettings);

// Products (public catalog)
router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/brands', productController.getBrands);
router.get('/products/:slug', productController.getProductBySlug);
router.get('/products/:id/related', productController.getRelatedProducts);

// Categories
router.get('/categories', categoryController.getCategories);
router.get('/categories/featured', categoryController.getFeaturedCategories);
router.get('/categories/:slug', categoryController.getCategoryBySlug);

export default router;
