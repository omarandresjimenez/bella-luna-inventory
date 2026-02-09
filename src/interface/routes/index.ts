import { Router } from 'express';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import adminProductRoutes from './admin-product.routes';
import adminOrderRoutes from './admin.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import supplierRoutes from './supplier.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Public catalog routes
router.use('/', publicRoutes);

// Cart routes (semi-public)
router.use('/cart', cartRoutes);

// Order routes (authenticated)
router.use('/orders', orderRoutes);

// Admin routes
router.use('/admin', adminProductRoutes);
router.use('/admin', adminOrderRoutes);

// Legacy routes (will be deprecated)
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
