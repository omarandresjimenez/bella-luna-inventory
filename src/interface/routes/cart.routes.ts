import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { CartController } from '../controllers/CartController';
import { CartService } from '../../application/services/CartService';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const cartService = new CartService(prisma);
const controller = new CartController(cartService);

// All cart routes use optional auth (support anonymous users with session ID)
router.use(optionalAuthMiddleware);

router.get('/', controller.getCart.bind(controller));
router.post('/items', controller.addItem.bind(controller));
router.patch('/items/:id', controller.updateItem.bind(controller));
router.delete('/items/:id', controller.removeItem.bind(controller));
router.delete('/', controller.clearCart.bind(controller));

export default router;
