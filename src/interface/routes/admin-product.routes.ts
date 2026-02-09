import { Router } from 'express';
import multer from 'multer';
import { AdminProductController } from '../controllers/AdminProductController';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AdminProductController();

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
router.get('/products', controller.getAllProducts);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

// Variant management
router.post('/products/:productId/variants', controller.createVariant);
router.put('/variants/:variantId', controller.updateVariant);

// Image management
router.post(
  '/products/:productId/images',
  upload.array('images', 10),
  controller.uploadImages
);
router.delete('/products/:productId/images/:imageId', controller.deleteImage);

export default router;
