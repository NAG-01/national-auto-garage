import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createExpenseSchema } from '../validators/expense.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), validate(createExpenseSchema), ExpenseController.create);
router.post('/bulk-delete', authorize(ROLES.ADMIN, ROLES.PARTNER), ExpenseController.bulkDelete);
router.get('/', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), ExpenseController.list);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), ExpenseController.getById);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), ExpenseController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.PARTNER), ExpenseController.delete);

export default router;
