import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get('/', authenticateUser, authorizeRoles('admin', 'staff'), getCoupons);
router.post('/', authenticateUser, authorizeRoles('admin', 'staff'), createCoupon);
router.put('/:couponId', authenticateUser, authorizeRoles('admin', 'staff'), updateCoupon);
router.delete('/:couponId', authenticateUser, authorizeRoles('admin', 'staff'), deleteCoupon);

export default router;
