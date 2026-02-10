import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { AdminAttributeController } from '../controllers/AdminAttributeController';
import { AttributeAdminService } from '../../application/services/AttributeAdminService';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();
const attributeService = new AttributeAdminService(prisma);
const controller = new AdminAttributeController(attributeService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Attribute management
router.get('/attributes', controller.getAllAttributes.bind(controller));
router.get('/attributes/:id', controller.getAttributeById.bind(controller));
router.post('/attributes', controller.createAttribute.bind(controller));
router.patch('/attributes/:id', controller.updateAttribute.bind(controller));
router.delete('/attributes/:id', controller.deleteAttribute.bind(controller));

// Attribute values management
router.post('/attributes/:id/values', controller.addAttributeValue.bind(controller));
router.delete('/attributes/values/:valueId', controller.removeAttributeValue.bind(controller));

export default router;
