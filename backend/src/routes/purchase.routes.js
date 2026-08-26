import { Router } from 'express';
import supplierOrderRoutes from './supplierOrder.routes.js';

const router = Router();
router.use('/', supplierOrderRoutes);

export default router;
