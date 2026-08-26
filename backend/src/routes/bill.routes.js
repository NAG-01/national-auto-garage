import { Router } from 'express';
import { BillController } from '../controllers/bill.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBillSchema, recordPaymentSchema } from '../validators/bill.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN), validate(createBillSchema), BillController.create);
router.get('/', BillController.list);
router.get('/:id', BillController.getById);
router.delete('/:id', BillController.delete);
router.post('/:id/payments', authorize(ROLES.ADMIN), validate(recordPaymentSchema), BillController.recordPayment);

export default router;
