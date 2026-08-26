import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateVehicleSchema } from '../validators/vehicle.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', VehicleController.list);
router.get('/:id', VehicleController.getById);
router.patch('/:id', validate(updateVehicleSchema), VehicleController.update);
router.patch('/:id/archive', VehicleController.archive);
router.patch('/:id/restore', VehicleController.restore);
router.delete('/:id', VehicleController.delete);
router.get('/:id/service-history', VehicleController.getServiceHistory);

export default router;
