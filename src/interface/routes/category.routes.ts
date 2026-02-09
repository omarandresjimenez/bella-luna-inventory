import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
