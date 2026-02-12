import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminCategoryController } from '../controllers/AdminCategoryController.js';
import { CategoryAdminService } from '../../application/services/CategoryAdminService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const categoryService = new CategoryAdminService(prisma);
const controller = new AdminCategoryController(categoryService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Category management
router.get('/categories', controller.getAllCategories.bind(controller));
router.get('/categories/:id', controller.getCategoryById.bind(controller));
router.post('/categories', controller.createCategory.bind(controller));
router.patch('/categories/:id', controller.updateCategory.bind(controller));
router.delete('/categories/:id', controller.deleteCategory.bind(controller));

// Category image management
router.post('/categories/:id/image', controller.updateCategoryImage.bind(controller));
router.delete('/categories/:id/image', controller.deleteCategoryImage.bind(controller));

export default router;

