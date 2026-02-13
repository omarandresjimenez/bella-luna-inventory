import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController.js';
import { authenticateCustomer } from '../middleware/auth.middleware.js';

const router = Router();
const customerController = new CustomerController();

// All routes require customer authentication
router.use(authenticateCustomer);

// Profile routes
router.get('/profile', customerController.getProfile.bind(customerController));
router.put('/profile', customerController.updateProfile.bind(customerController));
router.put('/profile/password', customerController.updatePassword.bind(customerController));

export default router;
