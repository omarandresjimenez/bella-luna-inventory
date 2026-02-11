import { Router } from 'express';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import addressRoutes from './address.routes';
import favoritesRoutes from './favorites.routes';
import adminProductRoutes from './admin-product.routes';
import adminOrderRoutes from './admin.routes';
import adminCategoryRoutes from './admin-category.routes';
import adminAttributeRoutes from './admin-attribute.routes';
import adminSettingsRoutes from './admin-settings.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Public catalog routes
router.use('/', publicRoutes);

// Cart, Order, Address and Favorites routes (customer)
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/favorites', favoritesRoutes);

// Admin routes
router.use('/admin', adminProductRoutes);
router.use('/admin', adminOrderRoutes);
router.use('/admin', adminCategoryRoutes);
router.use('/admin', adminAttributeRoutes);
router.use('/admin', adminSettingsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
