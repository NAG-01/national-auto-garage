import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/generate', authorize(ROLES.ADMIN, ROLES.PARTNER, ROLES.STAFF), InvoiceController.generate);
router.get('/', InvoiceController.list);
router.get('/:id', InvoiceController.getById);
router.delete('/:id', InvoiceController.delete);

export default router;
