import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAdminDashboard, getUsers, getBookingsAdmin, getRevenueReport } from '../controllers/adminController.js';

const router = express.Router();
router.use(authenticateUser, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.get('/bookings', getBookingsAdmin);
router.get('/revenue', getRevenueReport);

export default router;
