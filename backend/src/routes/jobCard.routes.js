import { Router } from 'express';
import { JobCardController } from '../controllers/jobCard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createJobCardSchema,
  updateJobCardSchema,
  updateJobCardStatusSchema,
} from '../validators/jobCard.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createJobCardSchema), JobCardController.create);
router.get('/', JobCardController.list);
router.get('/:id', JobCardController.getById);
router.patch('/:id', validate(updateJobCardSchema), JobCardController.update);
router.patch('/:id/status', validate(updateJobCardStatusSchema), JobCardController.updateStatus);
router.delete('/:id', JobCardController.delete);

export default router;
