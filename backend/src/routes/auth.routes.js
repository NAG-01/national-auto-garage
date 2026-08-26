import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.me);

// 2-Step Password Change Gate Endpoints
router.post('/verify-password', authenticate, AuthController.verifyPassword);
router.put('/update-password', authenticate, AuthController.updatePassword);

// Email OTP Username Change Endpoints
router.post('/request-email-otp', authenticate, AuthController.requestEmailOTP);
router.post('/verify-email-otp', authenticate, AuthController.verifyEmailOTP);

export default router;
