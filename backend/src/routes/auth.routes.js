import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { driverDocsUpload } from '../middleware/upload.middleware.js';

const router = Router();

// For driver signup, this route accepts multipart/form-data with licence & Aadhaar images
router.post('/signup', driverDocsUpload, signup);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
