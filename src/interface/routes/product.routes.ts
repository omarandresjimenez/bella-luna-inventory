import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

const router = Router();
const controller = new ProductController();

// router.get('/', controller.getAll); // Removed to allow fallthrough to public routes
router.get('/low-stock', controller.getLowStock);
router.get('/:id([0-9a-fA-F\\-]{36})', controller.getById);
router.post('/', controller.create);
router.put('/:id([0-9a-fA-F\\-]{36})', controller.update);
router.delete('/:id([0-9a-fA-F\\-]{36})', controller.delete);

export default router;
