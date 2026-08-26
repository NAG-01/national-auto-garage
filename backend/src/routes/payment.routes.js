import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { recordPaymentSchema } from '../validators/bill.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), validate(recordPaymentSchema), PaymentController.record);
router.get('/', PaymentController.list);

export default router;
