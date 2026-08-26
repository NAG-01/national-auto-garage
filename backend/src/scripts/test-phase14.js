import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { ReportService } from '../services/report.service.js';
import { JOB_STATUSES, JOB_TYPES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase14Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 14 REPORTS & ANALYTICS TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Product.deleteMany({});
    await ServiceJob.deleteMany({});
    await Bill.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});

    const testDate = new Date();

    // 1. Create Product inventory
    await Product.create({
      productId: 'PROD-1001',
      partNumber: 'OIL-4T-1L',
      name: 'Castrol Power1 4T 10W-30 (1L)',
      category: 'LUBRICANTS',
      purchaseCost: 350,
      sellingPrice: 480,
      currentStock: 10,
      minimumStockLevel: 2,
      unit: 'BOTTLE',
    });

    await Product.create({
      productId: 'PROD-1002',
      partNumber: 'BRK-PAD-01',
      name: 'Front Brake Pads',
      category: 'SPARE_PARTS',
      purchaseCost: 150,
      sellingPrice: 250,
      currentStock: 1,
      minimumStockLevel: 3,
      unit: 'PAIR',
    });

    // 2. Create Service Jobs
    await ServiceJob.create({
      jobId: 'JOB-2026-0001',
      customerId: new mongoose.Types.ObjectId(),
      vehicleId: new mongoose.Types.ObjectId(),
      customerNameSnapshot: 'Rakesh Patel',
      mobileNumberSnapshot: '9825099887',
      bikeNameSnapshot: 'Honda Activa 6G',
      registrationNumberSnapshot: 'GJ05AB1234',
      serviceDetails: 'Full service & oil change',
      status: JOB_STATUSES.COMPLETED,
      partsTotal: 480,
      labourCharges: 300,
      grandTotal: 780,
      serviceType: JOB_TYPES.FULL_SERVICE,
    });

    await ServiceJob.create({
      jobId: 'JOB-2026-0002',
      customerId: new mongoose.Types.ObjectId(),
      vehicleId: new mongoose.Types.ObjectId(),
      customerNameSnapshot: 'Manish Shah',
      mobileNumberSnapshot: '9825099888',
      bikeNameSnapshot: 'Bajaj Pulsar 220F',
      registrationNumberSnapshot: 'GJ05CD5678',
      serviceDetails: 'Full Engine overhaul',
      status: JOB_STATUSES.IN_PROGRESS,
      partsTotal: 3500,
      labourCharges: 2500,
      grandTotal: 6000,
      serviceType: JOB_TYPES.ENGINE_JOB,
    });

    // 3. Create Bill & Payment
    const mockProductId = new mongoose.Types.ObjectId();
    const bill1 = await Bill.create({
      billNumber: 'INV-2026-0001',
      jobId: new mongoose.Types.ObjectId(),
      customerId: new mongoose.Types.ObjectId(),
      vehicleId: new mongoose.Types.ObjectId(),
      customerName: 'Rakesh Patel',
      mobileNumber: '9825099887',
      bikeName: 'Honda Activa 6G',
      serviceType: 'FULL_SERVICE',
      items: [{ productId: mockProductId, productName: 'Castrol Engine Oil', quantity: 1, unitPrice: 480, total: 480 }],
      partsSubtotal: 480,
      labourCharges: 300,
      discount: 30,
      tax: 0,
      grandTotal: 750,
      totalPaid: 500,
      outstandingAmount: 250,
      paymentStatus: 'PARTIALLY_PAID',
      billDate: testDate,
    });

    await Payment.create({
      paymentId: 'PAY-2026-0001',
      billId: bill1._id,
      customerId: bill1.customerId,
      amount: 500,
      paymentMethod: 'UPI',
      paymentDate: testDate,
    });

    // 4. Create Expense
    await Expense.create({
      expenseNumber: 'EXP-2026-0001',
      category: 'RENT',
      amount: 200,
      description: 'Shop rent daily allocation',
      paidBy: 'GARAGE_ACCOUNT',
      date: testDate,
    });

    // -------------------------------------------------------------
    // TEST SUITE 1: Financial & Revenue Analytics Report
    // -------------------------------------------------------------
    console.log('[Suite 1] Financial & Revenue Analytics Report');
    const finReport = await ReportService.getFinancialReport({});

    assert(finReport.totalBilledRevenue === 750, 'Total billed revenue calculated: ₹750');
    assert(finReport.partsRevenue === 480, 'Parts revenue subtotal calculated: ₹480');
    assert(finReport.labourRevenue === 300, 'Labour charges subtotal calculated: ₹300');
    assert(finReport.totalDiscounts === 30, 'Discounts applied calculated: ₹30');
    assert(finReport.totalCashCollected === 500, 'Cash collected calculated: ₹500');
    assert(finReport.totalExpenses === 200, 'Operating expenses calculated: ₹200');
    assert(finReport.netProfit === 550, 'Net profit calculated: 750 - 200 = ₹550');
    assert(finReport.totalOutstanding === 250, 'Outstanding receivables calculated: ₹250');
    assert(finReport.expensesByCategory['RENT'] === 200, 'Rent expense category breakdown matches ₹200');

    // -------------------------------------------------------------
    // TEST SUITE 2: Service Job Analytics Report
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Service Job Analytics Report');
    const svcReport = await ReportService.getServiceReport({});

    assert(svcReport.totalJobs === 2, 'Total service jobs count is 2');
    assert(svcReport.byStatus[JOB_STATUSES.COMPLETED] === 1, 'Completed jobs count is 1');
    assert(svcReport.byStatus[JOB_STATUSES.IN_PROGRESS] === 1, 'In progress jobs count is 1');
    assert(svcReport.byServiceType[JOB_TYPES.FULL_SERVICE] === 1, 'Full service jobs count is 1');
    assert(svcReport.byServiceType[JOB_TYPES.ENGINE_JOB] === 1, 'Engine jobs count is 1');

    // -------------------------------------------------------------
    // TEST SUITE 3: Inventory Stock Valuation Report
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Inventory Stock Valuation Report');
    const invReport = await ReportService.getInventoryReport();

    assert(invReport.totalUniqueProducts === 2, 'Total unique catalog products is 2');
    assert(invReport.totalUnits === 11, 'Total stock units on hand is 10 + 1 = 11');
    assert(invReport.purchaseValuation === 3650, 'Purchase valuation calculated: (10*350) + (1*150) = ₹3,650');
    assert(invReport.sellingValuation === 5050, 'Selling valuation calculated: (10*480) + (1*250) = ₹5,050');
    assert(invReport.potentialMargin === 1400, 'Potential profit margin calculated: 5050 - 3650 = ₹1,400');
    assert(invReport.lowStockCount === 1, 'Low stock warning count is 1 (Front Brake Pads)');
    assert(invReport.categoryBreakdown['LUBRICANTS'].valuation === 3500, 'Lubricants category cost valuation is ₹3,500');

    console.log(`\n================================================================`);
    console.log(`  PHASE 14 COMPLETE: ALL REPORTS & ANALYTICS TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase14Tests().catch((err) => {
  console.error('Phase 14 Test Suite Failed:', err);
  process.exit(1);
});
