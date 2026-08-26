import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema, adjustStockSchema } from '../validators/inventory.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN), validate(createProductSchema), InventoryController.create);
router.get('/', InventoryController.list);
router.get('/categories', InventoryController.getCategories);
router.get('/:id', InventoryController.getById);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateProductSchema), InventoryController.update);
router.post('/adjust-stock', authorize(ROLES.ADMIN), validate(adjustStockSchema), InventoryController.adjustStock);
router.patch('/:id/archive', authorize(ROLES.ADMIN), InventoryController.archive);
router.delete('/:id', authorize(ROLES.ADMIN), InventoryController.delete);
router.get('/:id/movements', InventoryController.getMovements);

export default router;
