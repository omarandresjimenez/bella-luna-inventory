import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new CartController();

// All cart routes are optional auth (can be anonymous with session ID)
router.use(authMiddleware); // Will set req.user if token present

router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.put('/items/:id', controller.updateItem);
router.delete('/items/:id', controller.removeItem);
router.delete('/', controller.clearCart);

export default router;
