import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  listPendingDriverVerifications,
  approveDriver,
  rejectDriver,
  analyticsSummary,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/drivers/pending', listPendingDriverVerifications);
router.post('/drivers/:id/approve', approveDriver);
router.post('/drivers/:id/reject', rejectDriver);
router.get('/analytics/summary', analyticsSummary);

export default router;
