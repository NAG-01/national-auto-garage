import { Router } from 'express';
import { OutstandingController } from '../controllers/outstanding.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', OutstandingController.list);
router.post('/', OutstandingController.create);
router.put('/:id', OutstandingController.update);
router.delete('/:id', OutstandingController.remove);

export default router;
