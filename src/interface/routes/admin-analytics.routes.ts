import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminAnalyticsController } from '../controllers/AdminAnalyticsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new AdminAnalyticsController(prisma);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Analytics endpoints
router.get('/analytics/dashboard', controller.getDashboardStats.bind(controller));
router.get('/analytics/sales-over-time', controller.getSalesOverTime.bind(controller));
router.get('/analytics/top-products', controller.getTopProducts.bind(controller));
router.get('/analytics/sales-by-category', controller.getSalesByCategory.bind(controller));

export default router;
