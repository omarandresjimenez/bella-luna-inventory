import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../../application/services/OrderService';
import { CartService } from '../../application/services/CartService';
import { StoreService } from '../../application/services/StoreService';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const cartService = new CartService(prisma);
const storeService = new StoreService(prisma);
const orderService = new OrderService(prisma, cartService, storeService);
const controller = new OrderController(orderService);

// All order routes require authentication
router.use(authMiddleware);

router.post('/', controller.createOrder.bind(controller));
router.get('/', controller.getMyOrders.bind(controller));
router.get('/:id', controller.getOrderById.bind(controller));
router.post('/:id/cancel', controller.cancelOrder.bind(controller));

export default router;
