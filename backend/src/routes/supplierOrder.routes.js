import { Router } from 'express';
import { SupplierOrderController } from '../controllers/supplierOrder.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSupplierOrderSchema, updateSupplierOrderSchema } from '../validators/supplierOrder.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN), validate(createSupplierOrderSchema), SupplierOrderController.create);
router.get('/', SupplierOrderController.list);
router.get('/:id', SupplierOrderController.getById);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateSupplierOrderSchema), SupplierOrderController.update);
router.post('/:id/mark-ordered', authorize(ROLES.ADMIN), SupplierOrderController.markAsOrdered);
router.post('/:id/mark-received', authorize(ROLES.ADMIN), SupplierOrderController.markAsReceived);
router.post('/:id/cancel', authorize(ROLES.ADMIN), SupplierOrderController.cancel);
router.delete('/:id', authorize(ROLES.ADMIN), SupplierOrderController.delete);

export default router;
