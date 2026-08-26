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
import { OutstandingService } from '../services/outstanding.service.js';
import { PaymentService } from '../services/payment.service.js';
import { BillService } from '../services/bill.service.js';
import { JobCardService } from '../services/jobCard.service.js';
import { CustomerService } from '../services/customer.service.js';
import { VehicleService } from '../services/vehicle.service.js';
import { JOB_STATUSES, JOB_TYPES, PAYMENT_STATUSES } from '../config/constants.js';
import { roundMoney } from '../utils/currency.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase10Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 10 OUTSTANDING MODULE TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Product.deleteMany({});
    await ServiceJob.deleteMany({});
    await Bill.deleteMany({});
    await Payment.deleteMany({});
    await Bill.collection.dropIndexes().catch(() => {});
    await Bill.syncIndexes();

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    // Baseline Setup: 2 Customers, 2 Bikes, 2 Bills
    const cust1 = await CustomerService.createCustomer({
      name: 'Salim Pathan',
      mobileNumber: '9123456789',
    }, mockAdmin);

    const veh1 = await VehicleService.createVehicle(cust1._id, {
      bikeName: 'Bajaj Pulsar 150',
      registrationNumber: 'GJ05CD5678',
      currentKm: 34000,
    }, mockAdmin);

    const cust2 = await CustomerService.createCustomer({
      name: 'Usman Shaikh',
      mobileNumber: '9876501234',
    }, mockAdmin);

    const veh2 = await VehicleService.createVehicle(cust2._id, {
      bikeName: 'TVS Jupiter 125',
      registrationNumber: 'GJ05EF1234',
      currentKm: 18000,
    }, mockAdmin);

    // Bill 1 for Salim: Grand Total = ₹1,200
    const bill1 = await BillService.createBill({
      customerId: cust1._id,
      vehicleId: veh1._id,
      serviceType: JOB_TYPES.FULL_SERVICE,
      serviceDetails: 'Full Service for Pulsar',
      labourCharges: 1200,
    }, mockAdmin);

    // Bill 2 for Salim: Grand Total = ₹800
    const bill2 = await BillService.createBill({
      customerId: cust1._id,
      vehicleId: veh1._id,
      serviceType: JOB_TYPES.FULL_SERVICE,
      serviceDetails: 'Brake Overhaul for Pulsar',
      labourCharges: 800,
    }, mockAdmin);

    // Bill 3 for Usman: Grand Total = ₹1,500
    const bill3 = await BillService.createBill({
      customerId: cust2._id,
      vehicleId: veh2._id,
      serviceType: JOB_TYPES.ENGINE_JOB,
      serviceDetails: 'Clutch plate replacement',
      labourCharges: 1500,
    }, mockAdmin);

    // -------------------------------------------------------------
    // TEST SUITE 1: Outstanding Summary & Receivables Calculations
    // -------------------------------------------------------------
    console.log('[Suite 1] Outstanding Summary & Receivables Calculations');
    const summary1 = await OutstandingService.getOutstandingSummary();

    assert(summary1.totalReceivables === 3500, 'Total Receivables calculated: 1200 + 800 + 1500 = ₹3,500');
    assert(summary1.unpaidCount === 3, '3 UNPAID bills listed');
    assert(summary1.totalBillsWithOutstanding === 3, '3 bills with outstanding balance > 0');

    // -------------------------------------------------------------
    // TEST SUITE 2: Partial & Full Payment Effects on Outstanding
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Partial & Full Payment Effects on Outstanding');
    // Record Partial Payment of ₹500 on Bill 1
    await PaymentService.recordPayment({
      billId: bill1._id,
      amount: 500,
      paymentMethod: 'UPI',
      user: mockAdmin,
    });

    const summary2 = await OutstandingService.getOutstandingSummary();
    assert(summary2.totalReceivables === 3000, 'Total Receivables updated to ₹3,000 (3500 - 500)');
    assert(summary2.unpaidCount === 2, 'UNPAID bills count decreased to 2');
    assert(summary2.partiallyPaidCount === 1, 'PARTIALLY_PAID bills count increased to 1');

    // Record Full Payment on Bill 2 (₹800)
    await PaymentService.recordPayment({
      billId: bill2._id,
      amount: 800,
      paymentMethod: 'CASH',
      user: mockAdmin,
    });

    const summary3 = await OutstandingService.getOutstandingSummary();
    assert(summary3.totalReceivables === 2200, 'Total Receivables updated to ₹2,200 (3000 - 800)');
    assert(summary3.totalBillsWithOutstanding === 2, 'Fully paid bill excluded from outstanding list (count is 2)');

    // -------------------------------------------------------------
    // TEST SUITE 3: Customer Receivables Aggregation
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Customer Receivables Aggregation');
    const custSummary = await OutstandingService.getCustomerOutstandingSummary({});

    assert(custSummary.customers.length === 2, '2 customers aggregated with outstanding balances');
    const salimAgg = custSummary.customers.find((c) => c.name === 'Salim Pathan');
    assert(salimAgg.totalBilled === 1200, 'Salim total billed on outstanding invoices: ₹1,200');
    assert(salimAgg.totalPaid === 500, 'Salim total paid on outstanding invoices: ₹500');
    assert(salimAgg.totalOutstanding === 700, 'Salim remaining outstanding: ₹700 (Bill 1 balance)');
    assert(salimAgg.outstandingBillsCount === 1, 'Salim has 1 bill with remaining balance');

    // -------------------------------------------------------------
    // TEST SUITE 4: Mathematical Invariants & Overpayment Guards
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Mathematical Invariants & Overpayment Guards');
    const listResult = await OutstandingService.getOutstandingBills({});
    assert(listResult.bills.length === 2, 'Paginated outstanding bills list returns exactly 2 bills');

    for (const b of listResult.bills) {
      assert(b.outstandingAmount === roundMoney(b.grandTotal - b.totalPaid), `Bill ${b.billNumber} outstanding matches grandTotal - totalPaid`);
    }

    let overErr = false;
    try {
      await PaymentService.recordPayment({
        billId: bill1._id,
        amount: 800, // Balance is 700!
        paymentMethod: 'CASH',
        user: mockAdmin,
      });
    } catch (err) {
      overErr = true;
      assert(err.message.includes('cannot exceed outstanding balance'), `Overpayment rejected: "${err.message}"`);
    }
    assert(overErr === true, 'Overpayment attempt blocked');

    // -------------------------------------------------------------
    // TEST SUITE 5: Reconciliation Safety Engine Audit
    // -------------------------------------------------------------
    console.log('\n[Suite 5] Reconciliation Safety Engine Audit');
    const reconClean = await OutstandingService.reconcileOutstanding();
    assert(reconClean.isReconciled === true, 'Clean database verified with 0 discrepancies');

    // Intentionally corrupt cached Bill.totalPaid field to test detection
    const corruptBill = await Bill.findById(bill1._id);
    corruptBill.totalPaid = 100; // Actual paid is 500!
    await corruptBill.save();

    const reconCorrupt = await OutstandingService.reconcileOutstanding();
    assert(reconCorrupt.isReconciled === false, 'Reconciliation engine detected corrupted cached value');
    assert(reconCorrupt.discrepancyCount === 1, 'Exactly 1 discrepancy reported');
    assert(reconCorrupt.discrepancies[0].actualTotalPaidFromPayments === 500, 'Reconciliation engine accurately read ₹500 from Payment ledger');

    // Restore cached value
    corruptBill.totalPaid = 500;
    await corruptBill.save();

    const reconRestored = await OutstandingService.reconcileOutstanding();
    assert(reconRestored.isReconciled === true, 'Reconciliation engine verified restored database');

    console.log(`\n================================================================`);
    console.log(`  PHASE 10 COMPLETE: ALL OUTSTANDING MODULE TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase10Tests().catch((err) => {
  console.error('Phase 10 Test Suite Failed:', err);
  process.exit(1);
});
