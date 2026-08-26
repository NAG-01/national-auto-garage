import { Router } from 'express';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import jobCardRoutes from './jobCard.routes.js';
import inventoryRoutes from './inventory.routes.js';
import supplierRoutes from './supplier.routes.js';
import supplierOrderRoutes from './supplierOrder.routes.js';
import purchaseRoutes from './purchase.routes.js';
import expenseRoutes from './expense.routes.js';
import billRoutes from './bill.routes.js';
import paymentRoutes from './payment.routes.js';
import outstandingRoutes from './outstanding.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/jobs', jobCardRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/supplier-orders', supplierOrderRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/expenses', expenseRoutes);
router.use('/invoices', billRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/outstanding', outstandingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;
