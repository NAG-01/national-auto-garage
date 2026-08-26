import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSupplierSchema, updateSupplierSchema } from '../validators/supplier.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN), validate(createSupplierSchema), SupplierController.create);
router.get('/', SupplierController.list);
router.get('/:id', SupplierController.getById);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateSupplierSchema), SupplierController.update);
router.patch('/:id/archive', authorize(ROLES.ADMIN), SupplierController.archive);
router.patch('/:id/restore', authorize(ROLES.ADMIN), SupplierController.restore);
router.delete('/:id', authorize(ROLES.ADMIN), SupplierController.delete);

export default router;
