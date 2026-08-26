import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  recordTransactionSchema,
  finalizeSettlementSchema,
  settlementQuerySchema,
} from '../validators/partner.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/summary', validate(settlementQuerySchema), PartnerController.getSummary);
router.post('/transactions', validate(recordTransactionSchema), PartnerController.recordTransaction);
router.get('/transactions', PartnerController.getTransactions);
router.post('/finalize', validate(finalizeSettlementSchema), PartnerController.finalizeSettlement);
router.get('/history', PartnerController.getHistory);

export default router;
