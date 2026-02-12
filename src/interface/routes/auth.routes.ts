import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../../application/services/AuthService.js';
import { CartService } from '../../application/services/CartService.js';

const router = Router();
const authService = new AuthService(prisma);
const cartService = new CartService(prisma);
const controller = new AuthController(authService, cartService);

// Customer routes
router.post('/register', controller.registerCustomer.bind(controller));
router.post('/login', controller.loginCustomer.bind(controller));

// Admin routes
router.post('/admin/login', controller.loginAdmin.bind(controller));

// Common routes
router.post('/logout', controller.logout.bind(controller));
router.get('/me', controller.getMe.bind(controller));
router.post('/refresh', controller.refreshToken.bind(controller));

export default router;

