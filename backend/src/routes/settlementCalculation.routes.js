import { Router } from 'express';
import { SettlementCalculationController } from '../controllers/settlementCalculation.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), SettlementCalculationController.save);
router.post('/bulk-delete', authorize(ROLES.ADMIN, ROLES.PARTNER), SettlementCalculationController.bulkDelete);
router.get('/', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), SettlementCalculationController.list);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.PARTNER), SettlementCalculationController.delete);

export default router;
