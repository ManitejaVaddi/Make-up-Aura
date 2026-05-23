import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();
router.use(authenticateUser);
router.post('/order', createOrder);
router.post('/verify', verifyPayment);
export default router;
