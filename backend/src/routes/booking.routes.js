import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createBookingRequest,
  listMyBookings,
  listBookingsForRide,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} from '../controllers/booking.controller.js';

const router = Router();

// passenger
router.post('/', authenticate, createBookingRequest);
router.get('/me', authenticate, listMyBookings);
router.post('/:id/cancel', authenticate, cancelBooking);

// driver
router.get('/ride/:rideId', authenticate, listBookingsForRide);
router.post('/:id/accept', authenticate, acceptBooking);
router.post('/:id/reject', authenticate, rejectBooking);

export default router;
