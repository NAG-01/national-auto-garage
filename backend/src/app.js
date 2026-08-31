import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { sanitizeNoSQL } from './middleware/sanitize.middleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/apiError.js';

export const createApp = () => {
  const app = express();

  // Security headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline styles & fonts in local SPA
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Hardening
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Payload Size Limiter (Allows modern image/logo uploads safely)
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // NoSQL Injection Defense Middleware
  app.use(sanitizeNoSQL);

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // General API Rate Limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  });
  app.use('/api', generalLimiter);

  // Strict Brute-Force Login Rate Limiter (Max 5 attempts per 15 mins)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      success: false,
      message: 'Too many failed login attempts from this IP. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/login', loginLimiter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      system: 'National Auto Garage Secure API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api', routes);

  // 404 handler for unknown API routes
  app.use('*', (req, res, next) => {
    next(ApiError.notFound(`Endpoint ${req.originalUrl} not found`));
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
};
