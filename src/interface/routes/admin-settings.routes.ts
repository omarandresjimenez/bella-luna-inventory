import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminSettingsController } from '../controllers/AdminSettingsController.js';
import { StoreService } from '../../application/services/StoreService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const storeService = new StoreService(prisma);
const controller = new AdminSettingsController(storeService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Settings management
router.get('/settings', controller.getSettings.bind(controller));
router.patch('/settings', controller.updateSettings.bind(controller));

export default router;

