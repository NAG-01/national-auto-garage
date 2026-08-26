import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { VehicleController } from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator.js';
import { createVehicleSchema } from '../validators/vehicle.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCustomerSchema), CustomerController.create);
router.get('/', CustomerController.list);
router.get('/:id', CustomerController.getById);
router.patch('/:id', validate(updateCustomerSchema), CustomerController.update);
router.patch('/:id/archive', CustomerController.archive);
router.patch('/:id/restore', CustomerController.restore);
router.delete('/:id', CustomerController.delete);

// Customer Vehicle endpoints
router.post('/:id/vehicles', validate(createVehicleSchema), VehicleController.createForCustomer);
router.get('/:id/vehicles', VehicleController.list);

export default router;
