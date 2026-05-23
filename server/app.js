import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import passport from 'passport';
import { connectDatabase } from './config/db.js';
import { initPassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { loadEnv } from './utils/loadEnv.js';

loadEnv();
await connectDatabase();

const app = express();
const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(xss());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 120 }));
app.use(passport.initialize());
initPassport(passport);

const csrfProtection = csrf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' } });

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));
app.get('/api/csrf-token', csrfProtection, (req, res) => res.json({ csrfToken: req.csrfToken() }));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
