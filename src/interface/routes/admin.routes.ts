import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminOrderController } from '../controllers/AdminOrderController.js';
import { OrderService } from '../../application/services/OrderService.js';
import { CartService } from '../../application/services/CartService.js';
import { StoreService } from '../../application/services/StoreService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const cartService = new CartService(prisma);
const storeService = new StoreService(prisma);
const orderService = new OrderService(prisma, cartService, storeService);
const controller = new AdminOrderController(orderService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Order management
router.get('/orders', controller.getAllOrders.bind(controller));
router.get('/orders/:id', controller.getOrderById.bind(controller));
router.put('/orders/:id/status', controller.updateOrderStatus.bind(controller));
router.post('/orders/:id/cancel', controller.cancelOrder.bind(controller));

export default router;

