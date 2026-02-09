import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const controller = new AuthController();

// Customer routes
router.post('/register', controller.registerCustomer);
router.post('/login', controller.loginCustomer);

// Admin routes
router.post('/admin/login', controller.loginAdmin);

// Common routes
router.post('/refresh', controller.refreshToken);

export default router;
