import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Product } from '../models/Product.js';
import { roundMoney } from '../utils/currency.js';

export class ReportService {
  static async getFinancialReport({ startDate, endDate }) {
    const query = {};
    if (startDate || endDate) {
      query.$gte = startDate ? new Date(startDate) : new Date(2020, 0, 1);
      query.$lte = endDate ? new Date(endDate) : new Date();
    }

    const billQuery = query.$gte ? { billDate: query } : {};
    const paymentQuery = query.$gte ? { paymentDate: query } : {};
    const expenseQuery = query.$gte ? { date: query } : {};

    const [bills, payments, expenses] = await Promise.all([
      Bill.find(billQuery).lean(),
      Payment.find(paymentQuery).lean(),
      Expense.find(expenseQuery).lean(),
    ]);

    const totalBilledRevenue = roundMoney(bills.reduce((s, b) => s + (b.grandTotal || 0), 0));
    const partsRevenue = roundMoney(bills.reduce((s, b) => s + (b.partsSubtotal || 0), 0));
    const labourRevenue = roundMoney(bills.reduce((s, b) => s + (b.labourCharges || 0), 0));
    const totalDiscounts = roundMoney(bills.reduce((s, b) => s + (b.discount || 0), 0));

    const totalCashCollected = roundMoney(payments.reduce((s, p) => s + (p.amount || 0), 0));
    const totalExpenses = roundMoney(expenses.reduce((s, e) => s + (e.amount || 0), 0));
    const netProfit = roundMoney(totalBilledRevenue - totalExpenses);
    const totalOutstanding = roundMoney(bills.reduce((s, b) => s + (b.outstandingAmount || 0), 0));

    const expensesByCategory = {};
    for (const exp of expenses) {
      expensesByCategory[exp.category] = roundMoney((expensesByCategory[exp.category] || 0) + exp.amount);
    }

    return {
      totalBilledRevenue,
      partsRevenue,
      labourRevenue,
      totalDiscounts,
      totalCashCollected,
      totalExpenses,
      netProfit,
      totalOutstanding,
      expensesByCategory,
      billCount: bills.length,
      paymentCount: payments.length,
      expenseCount: expenses.length,
    };
  }

  static async getServiceReport({ startDate, endDate } = {}) {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const jobs = await ServiceJob.find(query)
      .populate('customerId', 'name')
      .populate('vehicleId', 'bikeName registrationNumber')
      .lean();

    const byStatus = {};
    const byServiceType = {};

    let totalLabourCharges = 0;
    let totalPartsCharges = 0;

    for (const job of jobs) {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
      const type = job.serviceType || 'FULL_SERVICE';
      byServiceType[type] = (byServiceType[type] || 0) + 1;

      totalLabourCharges += job.labourCharges || 0;
      totalPartsCharges += job.partsTotal || 0;
    }

    return {
      totalJobs: jobs.length,
      byStatus,
      byServiceType,
      totalLabourCharges: roundMoney(totalLabourCharges),
      totalPartsCharges: roundMoney(totalPartsCharges),
    };
  }

  static async getInventoryReport() {
    const products = await Product.find({ isActive: true }).lean();

    let purchaseValuation = 0;
    let sellingValuation = 0;
    let totalUnits = 0;
    let lowStockCount = 0;

    const categoryBreakdown = {};

    for (const prod of products) {
      const stockQty = prod.currentStock ?? prod.stock ?? 0;
      const minStockQty = prod.minimumStockLevel ?? prod.minStock ?? 3;

      const pVal = stockQty * (prod.purchaseCost || 0);
      const sVal = stockQty * (prod.sellingPrice || 0);

      purchaseValuation += pVal;
      sellingValuation += sVal;
      totalUnits += stockQty;

      if (stockQty <= minStockQty) {
        lowStockCount++;
      }

      if (!categoryBreakdown[prod.category]) {
        categoryBreakdown[prod.category] = { count: 0, units: 0, valuation: 0 };
      }
      categoryBreakdown[prod.category].count += 1;
      categoryBreakdown[prod.category].units += stockQty;
      categoryBreakdown[prod.category].valuation = roundMoney(categoryBreakdown[prod.category].valuation + pVal);
    }

    const potentialMargin = roundMoney(sellingValuation - purchaseValuation);

    return {
      purchaseValuation: roundMoney(purchaseValuation),
      sellingValuation: roundMoney(sellingValuation),
      potentialMargin,
      totalUniqueProducts: products.length,
      totalUnits,
      lowStockCount,
      categoryBreakdown,
    };
  }
}
