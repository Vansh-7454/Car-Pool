import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listNotifications, markNotificationRead } from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.post('/:id/read', markNotificationRead);

export default router;
