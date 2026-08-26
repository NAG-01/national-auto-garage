import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Product } from '../models/Product.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { DashboardService } from '../services/dashboard.service.js';
import { CustomerService } from '../services/customer.service.js';
import { VehicleService } from '../services/vehicle.service.js';
import { JobCardService } from '../services/jobCard.service.js';
import { BillService } from '../services/bill.service.js';
import { PaymentService } from '../services/payment.service.js';
import { JOB_STATUSES, JOB_TYPES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase12Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 12 DASHBOARD & VEHICLES TESTS`);
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

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    // 1. Create baseline customer & vehicle
    const cust = await CustomerService.createCustomer({
      name: 'Vikas Sharma',
      mobileNumber: '9825012345',
    }, mockAdmin);

    const veh = await VehicleService.createVehicle(cust._id, {
      bikeName: 'Hero Splendor Plus',
      registrationNumber: 'GJ05AB9988',
      currentKm: 25000,
    }, mockAdmin);

    // 2. Create Low Stock Product
    const lowProd = await Product.create({
      productId: 'PROD-0001',
      partNumber: 'SPK-PLUG-01',
      name: 'NGK Spark Plug',
      category: 'SPARE_PARTS',
      purchaseCost: 80,
      sellingPrice: 120,
      stock: 2,
      minStock: 5,
      unit: 'PCS',
    });

    // 3. Create Service Jobs
    const job1 = await JobCardService.createJob({
      customerId: cust._id,
      vehicleId: veh._id,
      serviceType: JOB_TYPES.FULL_SERVICE,
      serviceDetails: 'Engine oil change & general checkup',
      labourCharges: 300,
    }, mockAdmin);

    // 4. Create Bill & Payment today
    const bill1 = await BillService.createBill({
      jobId: job1._id,
      discount: 0,
      tax: 0,
    }, mockAdmin);

    await PaymentService.recordPayment({
      billId: bill1._id,
      amount: 300,
      paymentMethod: 'CASH',
      user: mockAdmin,
    });

    // 5. Create Expense
    await Expense.create({
      expenseNumber: 'EXP-2026-0001',
      category: 'ELECTRICITY',
      amount: 100,
      description: 'Daily shop electricity',
      date: new Date(),
      paidBy: 'GARAGE_ACCOUNT',
    });

    // -------------------------------------------------------------
    // TEST SUITE 1: Dashboard Metrics Calculations
    // -------------------------------------------------------------
    console.log('[Suite 1] Dashboard Metrics Calculations');
    const metrics = await DashboardService.getDashboardMetrics();

    assert(metrics.kpis.todayRevenue === 300, 'Today cash collections calculated: ₹300');
    assert(metrics.kpis.monthlyRevenue === 300, 'Monthly billed revenue calculated: ₹300');
    assert(metrics.kpis.monthlyExpenses === 100, 'Monthly expenses calculated: ₹100');
    assert(metrics.kpis.monthlyProfit === 200, 'Monthly net profit calculated: 300 - 100 = ₹200');
    assert(metrics.kpis.pendingServices === 1, 'Pending services count is 1');
    assert(metrics.kpis.vehiclesInGarage === 1, 'Vehicles in garage count is 1');
    assert(metrics.lowStockParts.length === 1, 'Low stock alert returns 1 item');
    assert(metrics.lowStockParts[0].name === 'NGK Spark Plug', 'Low stock item name matches NGK Spark Plug');

    // -------------------------------------------------------------
    // TEST SUITE 2: Recent Streams & Activity Feeds
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Recent Streams & Activity Feeds');
    assert(metrics.recentJobs.length === 1, 'Recent jobs feed returns 1 item');
    assert(metrics.recentPayments.length === 1, 'Recent payments feed returns 1 item');

    console.log(`\n================================================================`);
    console.log(`  PHASE 12 COMPLETE: ALL DASHBOARD & VEHICLE TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase12Tests().catch((err) => {
  console.error('Phase 12 Test Suite Failed:', err);
  process.exit(1);
});
