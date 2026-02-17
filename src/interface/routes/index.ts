import { Router } from 'express';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import addressRoutes from './address.routes.js';
import favoritesRoutes from './favorites.routes.js';
import customerRoutes from './customer.routes.js';
import adminProductRoutes from './admin-product.routes.js';
import adminOrderRoutes from './admin.routes.js';
import adminCategoryRoutes from './admin-category.routes.js';
import adminAttributeRoutes from './admin-attribute.routes.js';
import adminSettingsRoutes from './admin-settings.routes.js';
import adminAnalyticsRoutes from './admin-analytics.routes.js';
import adminUserRoutes from './admin-user.routes.js';
import adminCustomerRoutes from './admin-customer.routes.js';
import notificationRoutes from '../controllers/NotificationController.js';

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
router.use('/customer', customerRoutes);

// Admin routes
router.use('/admin', adminProductRoutes);
router.use('/admin', adminOrderRoutes);
router.use('/admin', adminCategoryRoutes);
router.use('/admin', adminAttributeRoutes);
router.use('/admin', adminSettingsRoutes);
router.use('/admin', adminAnalyticsRoutes);
router.use('/admin', adminUserRoutes);
router.use('/admin', adminCustomerRoutes);

// Notification routes (polling fallback for Vercel)
router.use('/', notificationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
