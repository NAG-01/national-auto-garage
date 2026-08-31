import { Router } from 'express';
import { WebsiteConfigController } from '../controllers/websiteConfig.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// 1. PUBLIC ENDPOINTS (No Auth Required)
router.get('/public', WebsiteConfigController.getPublicConfig);

// 2. ADMIN CMS ENDPOINTS (Protected)
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.PARTNER), WebsiteConfigController.getAdminConfig);
router.put('/', authenticate, authorize(ROLES.ADMIN, ROLES.PARTNER), WebsiteConfigController.updateAdminConfig);
router.post('/reset', authenticate, authorize(ROLES.ADMIN, ROLES.PARTNER), WebsiteConfigController.resetAdminConfig);

export default router;
