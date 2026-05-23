import express from 'express';
import passport from 'passport';
import {
  registerUser,
  adminRegisterUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback
} from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, adminRegisterSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/admin-register', validateRequest(adminRegisterSchema), adminRegisterUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
