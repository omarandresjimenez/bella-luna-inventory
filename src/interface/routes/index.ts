import { Router } from 'express';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import supplierRoutes from './supplier.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
