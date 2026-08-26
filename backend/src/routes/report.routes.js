import { Router } from 'express';
import { ReportController, SettingsController } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.PARTNER));

router.get('/financial', ReportController.getFinancial);
router.get('/service', ReportController.getService);
router.get('/inventory', ReportController.getInventory);

export default router;
