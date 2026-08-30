import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';

export const DashboardService = {
  async getMetrics() {
    try {
      // 1. Inventory low stock check
      const invSnap = await getDocs(collection(db, 'inventory'));
      let lowStockParts = [];
      let totalProducts = 0;
      invSnap.forEach((d) => {
        totalProducts++;
        const p = { _id: d.id, id: d.id, ...d.data() };
        if (p.isActive !== false && Number(p.currentStock || 0) <= Number(p.minimumStockLevel || 5)) {
          lowStockParts.push({
            _id: p._id,
            id: p.id,
            name: p.name,
            productId: p.productId,
            stockQuantity: Number(p.currentStock || 0),
            currentStock: Number(p.currentStock || 0),
            minStockThreshold: Number(p.minimumStockLevel || 5),
            minimumStockLevel: Number(p.minimumStockLevel || 5),
            unit: p.unit || 'PCS',
          });
        }
      });

      // 2. Jobs metrics
      const jobSnap = await getDocs(collection(db, 'jobs'));
      let activeJobsCount = 0;
      let completedJobsCount = 0;
      jobSnap.forEach((d) => {
        const j = d.data();
        if (j.status === 'COMPLETED' || j.status === 'DELIVERED') {
          completedJobsCount++;
        } else if (j.status !== 'CANCELLED') {
          activeJobsCount++;
        }
      });

      // 3. Revenue from Invoices / Payments
      const billSnap = await getDocs(collection(db, 'invoices'));
      let totalRevenue = 0;
      billSnap.forEach((d) => {
        const b = d.data();
        totalRevenue += Number(b.totalPaid || b.paidAmount || 0);
      });

      // 4. Pending Dues
      const duesSnap = await getDocs(collection(db, 'outstanding'));
      let pendingDues = 0;
      duesSnap.forEach((d) => {
        const due = d.data();
        if (due.isActive !== false) {
          pendingDues += Number(due.pendingAmount || 0);
        }
      });

      return {
        success: true,
        lowStockParts,
        totalRevenue,
        pendingDues,
        activeJobsCount,
        completedJobsCount,
        totalProducts,
      };
    } catch (err) {
      console.error('Failed to load dashboard metrics from Firestore:', err);
      return {
        success: true,
        lowStockParts: [],
        totalRevenue: 0,
        pendingDues: 0,
        activeJobsCount: 0,
        completedJobsCount: 0,
        totalProducts: 0,
      };
    }
  },
};
