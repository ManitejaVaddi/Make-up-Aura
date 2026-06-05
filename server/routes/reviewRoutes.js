import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { createReview, getReviews, deleteReview, verifyReview } from '../controllers/reviewController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createReviewSchema } from '../validators/reviewValidator.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authenticateUser, validateRequest(createReviewSchema), createReview);
router.patch('/:reviewId/verify', authenticateUser, authorizeRoles('admin', 'staff'), verifyReview);
router.delete('/:reviewId', authenticateUser, deleteReview);

export default router;
