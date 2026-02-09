import { Router } from 'express';
import { AdminOrderController } from '../controllers/AdminOrderController';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AdminOrderController();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Order management
router.get('/orders', controller.getAllOrders);
router.get('/orders/:id', controller.getOrderById);
router.put('/orders/:id/status', controller.updateOrderStatus);
router.post('/orders/:id/cancel', controller.cancelOrder);

export default router;
