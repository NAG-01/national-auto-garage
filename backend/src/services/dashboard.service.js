import { ServiceJob } from '../models/ServiceJob.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { JOB_STATUSES } from '../config/constants.js';
import { roundMoney } from '../utils/currency.js';

export class DashboardService {
  static async getDashboardMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Today's Cash Collections
    const todayPaymentsAgg = await Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const todayRevenue = roundMoney(todayPaymentsAgg[0]?.total || 0);

    // 2. Monthly Billed Revenue
    const monthlyBillsAgg = await Bill.aggregate([
      { $match: { billDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const monthlyRevenue = roundMoney(monthlyBillsAgg[0]?.total || 0);

    // 3. Monthly Operating Expenses
    const monthlyExpensesAgg = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthlyExpenses = roundMoney(monthlyExpensesAgg[0]?.total || 0);

    // 4. Monthly Net Profit
    const monthlyProfit = roundMoney(monthlyRevenue - monthlyExpenses);

    // 5. Pending Services
    const pendingServices = await ServiceJob.countDocuments({
      status: { $in: [JOB_STATUSES.PENDING, JOB_STATUSES.IN_PROGRESS] },
    });

    // 6. Vehicles currently in garage
    const vehiclesInGarage = await ServiceJob.countDocuments({
      status: { $in: [JOB_STATUSES.PENDING, JOB_STATUSES.IN_PROGRESS, JOB_STATUSES.COMPLETED] },
    });

    // 7. Completed services this month
    const completedServices = await ServiceJob.countDocuments({
      status: { $in: [JOB_STATUSES.COMPLETED, JOB_STATUSES.DELIVERED] },
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // 8. Outstanding Customer Payments across all bills
    const outstandingAgg = await Bill.aggregate([
      { $match: { outstandingAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$outstandingAmount' } } },
    ]);
    const outstandingPayments = roundMoney(outstandingAgg[0]?.total || 0);

    // 9. Low stock alert products
    const rawLowStockParts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStockLevel'] },
    })
      .sort({ currentStock: 1 })
      .limit(10)
      .lean();

    const lowStockParts = rawLowStockParts.map((p) => ({
      _id: p._id,
      productId: p.productId,
      name: p.name,
      category: p.category || 'General',
      currentStock: Number(p.currentStock ?? 0),
      minimumStockLevel: Number(p.minimumStockLevel ?? 3),
      unit: p.unit || 'PCS',
    }));

    // 10. Recent Jobs
    const recentJobs = await ServiceJob.find()
      .populate('customerId', 'name mobileNumber')
      .populate('vehicleId', 'bikeName registrationNumber')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // 11. Recent Payments
    const recentPayments = await Payment.find()
      .populate('customerId', 'name mobileNumber')
      .populate('billId', 'billNumber grandTotal')
      .sort({ paymentDate: -1 })
      .limit(6)
      .lean();

    // 12. Partner Profit Split Estimate
    const naimEstimatedPayout = roundMoney(monthlyProfit * 0.5);
    const imranEstimatedPayout = roundMoney(monthlyProfit * 0.5);

    return {
      kpis: {
        todayRevenue,
        monthlyRevenue,
        monthlyExpenses,
        monthlyProfit,
        pendingServices,
        vehiclesInGarage,
        completedServices,
        outstandingPayments,
        naimEstimatedPayout,
        imranEstimatedPayout,
      },
      lowStockParts: lowStockParts.map((p) => ({
        _id: p._id,
        name: p.name,
        partNumber: p.partNumber,
        currentStock: p.stock,
        minStockLevel: p.minStock,
      })),
      recentJobs,
      recentPayments,
    };
  }
}
