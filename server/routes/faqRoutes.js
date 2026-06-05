import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { createFAQ, getFAQs, deleteFAQ } from '../controllers/faqController.js';

const router = express.Router();

router.get('/', getFAQs);
router.post('/', authenticateUser, authorizeRoles('admin', 'staff'), createFAQ);
router.delete('/:faqId', authenticateUser, authorizeRoles('admin', 'staff'), deleteFAQ);

export default router;
