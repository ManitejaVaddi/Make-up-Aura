import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAdminDashboard, getUsers, getBookingsAdmin, getRevenueReport, getPopularPackages, getCouponCampaigns, getAdminNotifications, markNotificationRead } from '../controllers/adminController.js';
import { getSlots, blockSlot, unblockSlot } from '../controllers/slotController.js';

const router = express.Router();
router.use(authenticateUser, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);
router.get('/users', getUsers);
router.get('/bookings', getBookingsAdmin);
router.get('/revenue', getRevenueReport);
router.get('/popular', getPopularPackages);
router.get('/coupons', getCouponCampaigns);
router.get('/slots', getSlots);
router.post('/slots/block', blockSlot);
router.delete('/slots/block/:id', unblockSlot);

export default router;
