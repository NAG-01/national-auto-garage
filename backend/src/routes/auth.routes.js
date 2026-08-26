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

// Real Gmail Magic Verification Link Endpoints
router.post('/request-email-magic-link', authenticate, AuthController.requestEmailMagicLink);
router.get('/verify-email-token', AuthController.verifyEmailToken);

export default router;
