import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new OrderController();

// All order routes require authentication
router.use(authMiddleware);

router.post('/', controller.createOrder);
router.get('/', controller.getMyOrders);
router.get('/:id', controller.getOrderById);
router.post('/:id/cancel', controller.cancelOrder);

export default router;
