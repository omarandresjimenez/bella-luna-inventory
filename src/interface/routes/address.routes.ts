import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { AddressController } from '../controllers/AddressController';
import { AddressService } from '../../application/services/AddressService';
import { authMiddleware } from '../middleware/auth.middleware';

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
