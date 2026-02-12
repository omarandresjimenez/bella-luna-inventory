import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AddressController } from '../controllers/AddressController.js';
import { AddressService } from '../../application/services/AddressService.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const addressService = new AddressService(prisma);
const controller = new AddressController(addressService);

// All address routes require authentication
router.use(authMiddleware);

router.get('/', controller.getAddresses.bind(controller));
router.post('/', controller.createAddress.bind(controller));
router.patch('/:id', controller.updateAddress.bind(controller));
router.delete('/:id', controller.deleteAddress.bind(controller));

export default router;

