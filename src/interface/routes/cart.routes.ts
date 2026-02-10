import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { CartController } from '../controllers/CartController';
import { CartService } from '../../application/services/CartService';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const cartService = new CartService(prisma);
const controller = new CartController(cartService);

// All cart routes are optional auth (can be anonymous with session ID)
router.use(authMiddleware); // Will set req.user if token present

router.get('/', controller.getCart.bind(controller));
router.post('/items', controller.addItem.bind(controller));
router.put('/items/:id', controller.updateItem.bind(controller));
router.delete('/items/:id', controller.removeItem.bind(controller));
router.delete('/', controller.clearCart.bind(controller));

export default router;
