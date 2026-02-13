import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminUserController } from '../controllers/AdminUserController.js';
import { UserAdminService } from '../../application/services/UserAdminService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const userService = new UserAdminService(prisma);
const controller = new AdminUserController(userService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// User management
router.get('/users', controller.getAllUsers.bind(controller));
router.get('/users/stats', controller.getUsersStats.bind(controller));
router.get('/users/:id', controller.getUserById.bind(controller));
router.post('/users', controller.createUser.bind(controller));
router.patch('/users/:id', controller.updateUser.bind(controller));
router.delete('/users/:id', controller.deleteUser.bind(controller));
router.patch('/users/:id/toggle-status', controller.toggleUserStatus.bind(controller));

export default router;
