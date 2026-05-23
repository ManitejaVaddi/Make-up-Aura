import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/userModel.js';
import { sendEmail } from '../config/mailer.js';
import { generateTokenPair } from '../utils/auth.js';
import { welcomeEmail, passwordResetEmail } from '../utils/emailTemplates.js';

function setTokenCookies(res, refreshToken) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, password, phone, location } = req.validated;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, location, authProvider: 'email' });
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();
    setTokenCookies(res, refreshToken);
    await sendEmail({ to: email, subject: 'Welcome to Bridal Beauty Studio', html: welcomeEmail(name) });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
  } catch (error) {
    next(error);
  }
}

export async function adminRegisterUser(req, res, next) {
  try {
    const { name, email, password } = req.validated;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, role: 'admin', authProvider: 'email' });
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();
    setTokenCookies(res, refreshToken);
    await sendEmail({ to: email, subject: 'Welcome to Bridal Beauty Studio Admin', html: welcomeEmail(name) });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.validated;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();
    setTokenCookies(res, refreshToken);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logoutUser(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      res.clearCookie('refreshToken');
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
    user.refreshToken = newRefreshToken;
    await user.save();
    setTokenCookies(res, newRefreshToken);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    }
    const token = jwt.sign({ id: user._id, action: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail({ to: email, subject: 'Reset your password', html: passwordResetEmail(user.name, resetUrl) });
    res.json({ message: 'Password reset instructions sent' });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.validated;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.password = password;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

export function googleAuth(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

export function googleCallback(req, res, next) {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google`);
    }
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.redirect(`${process.env.CLIENT_URL}/dashboard?accessToken=${accessToken}`);
  })(req, res, next);
}
