import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { createTestimonial, getTestimonials, deleteTestimonial } from '../controllers/testimonialController.js';

const router = express.Router();

router.get('/', getTestimonials);
router.post('/', authenticateUser, authorizeRoles('admin', 'staff'), createTestimonial);
router.delete('/:testimonialId', authenticateUser, authorizeRoles('admin', 'staff'), deleteTestimonial);

export default router;
