import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';

const router = Router();
const controller = new SupplierController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
