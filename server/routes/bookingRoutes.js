import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking
} from '../controllers/bookingController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createBookingSchema, updateBookingSchema } from '../validators/bookingValidator.js';

const router = express.Router();

router.use(authenticateUser);
router.post('/', validateRequest(createBookingSchema), createBooking);
router.get('/', getBookings);
router.get('/:bookingId', getBooking);
router.patch('/:bookingId', authorizeRoles('admin', 'staff'), validateRequest(updateBookingSchema), updateBooking);
router.delete('/:bookingId', cancelBooking);

export default router;
