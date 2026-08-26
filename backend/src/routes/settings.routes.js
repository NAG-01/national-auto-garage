import { Router } from 'express';
import { SettingsController } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', SettingsController.getSettings);
router.put('/', authorize(ROLES.ADMIN, ROLES.PARTNER), SettingsController.updateSettings);
router.get('/audit-logs', authorize(ROLES.ADMIN, ROLES.PARTNER), SettingsController.getAuditLogs);

export default router;
