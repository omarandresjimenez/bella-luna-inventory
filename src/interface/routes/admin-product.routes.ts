import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../../infrastructure/database/prisma';
import { AdminProductController } from '../controllers/AdminProductController';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AdminProductController(prisma);

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo JPG, PNG y WebP'));
    }
  },
});

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Product management
router.get('/products', controller.getAllProducts.bind(controller));
router.get('/products/:id', controller.getProductById.bind(controller));
router.post('/products', controller.createProduct.bind(controller));
router.put('/products/:id', controller.updateProduct.bind(controller));
router.delete('/products/:id', controller.deleteProduct.bind(controller));

// Variant management
router.post('/products/:productId/variants', controller.createVariant.bind(controller));
router.put('/variants/:variantId', controller.updateVariant.bind(controller));

// Image management
router.post(
  '/products/:productId/images',
  upload.array('images', 10),
  controller.uploadImages.bind(controller)
);
router.delete('/products/:productId/images/:imageId', controller.deleteImage.bind(controller));
router.patch('/products/:productId/images/:imageId/primary', controller.setPrimaryImage.bind(controller));

export default router;
