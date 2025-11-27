import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createRide, listRides, listMyRides, getRideById, cancelRide } from '../controllers/ride.controller.js';

const router = Router();

router.get('/', listRides);
router.get('/me', authenticate, listMyRides);
router.get('/:id', getRideById);
router.post('/', authenticate, createRide);
router.delete('/:id', authenticate, cancelRide);

export default router;
