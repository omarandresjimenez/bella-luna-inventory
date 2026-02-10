import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import { AdminSettingsController } from '../controllers/AdminSettingsController';
import { StoreService } from '../../application/services/StoreService';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();
const storeService = new StoreService(prisma);
const controller = new AdminSettingsController(storeService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Settings management
router.get('/settings', controller.getSettings.bind(controller));
router.patch('/settings', controller.updateSettings.bind(controller));

export default router;
