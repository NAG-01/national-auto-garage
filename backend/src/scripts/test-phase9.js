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
import { BillService } from '../services/bill.service.js';
import { PaymentService } from '../services/payment.service.js';
import { JobCardService } from '../services/jobCard.service.js';
import { CustomerService } from '../services/customer.service.js';
import { VehicleService } from '../services/vehicle.service.js';
import { JOB_STATUSES, JOB_TYPES, PAYMENT_STATUSES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase9Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 9 BILLING & INVOICING TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Product.deleteMany({});
    await ServiceJob.deleteMany({});
    await Bill.deleteMany({});
    await Payment.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    // Baseline Setup
    const cust = await CustomerService.createCustomer({
      name: 'Imran Khan',
      mobileNumber: '9876543210',
    }, mockAdmin);

    const veh = await VehicleService.createVehicle(cust._id, {
      bikeName: 'Hero Splendor Plus',
      registrationNumber: 'GJ05AB1234',
      currentKm: 22000,
    }, mockAdmin);

    const prodOil = await Product.create({
      productId: 'PRD-0020',
      name: 'Castrol 4T 20W40 1L Engine Oil',
      category: 'LUBRICANTS',
      currentStock: 15,
      minimumStockLevel: 5,
      sellingPrice: 420,
      purchaseCost: 320,
    });

    const job = await JobCardService.createJob({
      customerId: cust._id,
      vehicleId: veh._id,
      serviceType: JOB_TYPES.FULL_SERVICE,
      serviceDetails: 'Full periodic service and oil replacement',
      items: [{ productId: prodOil._id, quantity: 2 }],
      labourCharges: 300,
    }, mockAdmin);

    // Complete the job so it can be billed
    await JobCardService.updateJobStatus(job._id, JOB_STATUSES.COMPLETED, mockAdmin);

    // -------------------------------------------------------------
    // TEST SUITE 1: Atomic Bill Number Generation & Creation
    // -------------------------------------------------------------
    console.log('[Suite 1] Atomic Bill Number Generation & Creation');
    const bill = await BillService.createBill({
      jobId: job._id,
      discount: 40,
      tax: 0,
    }, mockAdmin);

    assert(bill.billNumber.startsWith('INV-') || bill.billNumber.includes('-'), `Bill number generated: ${bill.billNumber}`);
    assert(bill.customerId.toString() === cust._id.toString(), 'Customer ID correctly referenced');
    assert(bill.vehicleId.toString() === veh._id.toString(), 'Vehicle ID correctly referenced');
    assert(bill.jobId.toString() === job._id.toString(), 'ServiceJob ID correctly referenced');

    // -------------------------------------------------------------
    // TEST SUITE 2: Historical Price Snapshots & Financial Totals
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Historical Price Snapshots & Financial Totals');
    assert(bill.items.length === 1, '1 item snapshotted in bill');
    assert(bill.items[0].productName === 'Castrol 4T 20W40 1L Engine Oil', 'Product name snapshotted');
    assert(bill.items[0].unitPrice === 420, 'Unit price snapshotted (₹420)');
    assert(bill.items[0].total === 840, 'Line total calculated: 420 * 2 = ₹840');
    assert(bill.partsSubtotal === 840, 'Parts subtotal calculated: ₹840');
    assert(bill.labourCharges === 300, 'Labour charges set: ₹300');
    assert(bill.discount === 40, 'Discount applied: ₹40');
    assert(bill.grandTotal === 1100, 'Grand total calculated: 840 + 300 - 40 = ₹1,100');

    // Test Historical Price Protection on Catalog Change
    prodOil.sellingPrice = 500;
    await prodOil.save();

    const fetchBill = await Bill.findById(bill._id);
    assert(fetchBill.items[0].unitPrice === 420, 'Bill line item unit price remains ₹420 after catalog price updated to ₹500');
    assert(fetchBill.grandTotal === 1100, 'Bill grand total remains ₹1,100 after catalog price update');

    // -------------------------------------------------------------
    // TEST SUITE 3: Initial UNPAID State & Payment Rejections
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Initial UNPAID State & Payment Rejections');
    assert(bill.paymentStatus === PAYMENT_STATUSES.UNPAID, 'Initial bill paymentStatus is UNPAID');
    assert(bill.totalPaid === 0, 'Initial totalPaid is ₹0');
    assert(bill.outstandingAmount === 1100, 'Initial outstandingAmount equals grandTotal (₹1,100)');

    // Zero Payment Rejection Test
    let zeroErr = false;
    try {
      await PaymentService.recordPayment({
        billId: bill._id,
        amount: 0,
        paymentMethod: 'CASH',
        user: mockAdmin,
      });
    } catch (err) {
      zeroErr = true;
      assert(err.message.includes('greater than zero'), `Zero payment rejected: "${err.message}"`);
    }
    assert(zeroErr === true, 'Zero payment attempt blocked');

    // Overpayment Rejection Test
    let overErr = false;
    try {
      await PaymentService.recordPayment({
        billId: bill._id,
        amount: 1500, // Outstanding is 1100!
        paymentMethod: 'CASH',
        user: mockAdmin,
      });
    } catch (err) {
      overErr = true;
      assert(err.message.includes('cannot exceed outstanding balance'), `Overpayment rejected: "${err.message}"`);
    }
    assert(overErr === true, 'Overpayment attempt blocked');

    // -------------------------------------------------------------
    // TEST SUITE 4: Partial Payment & PARTIALLY_PAID Status
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Partial Payment & PARTIALLY_PAID Status');
    const pay1 = await PaymentService.recordPayment({
      billId: bill._id,
      amount: 500,
      paymentMethod: 'UPI',
      notes: 'Advance UPI payment',
      user: mockAdmin,
    });

    const billAfterPay1 = await Bill.findById(bill._id);
    assert(billAfterPay1.paymentStatus === PAYMENT_STATUSES.PARTIALLY_PAID, 'Payment status updated to PARTIALLY_PAID');
    assert(billAfterPay1.totalPaid === 500, 'Total paid is ₹500');
    assert(billAfterPay1.outstandingAmount === 600, 'Outstanding balance is ₹600 (1100 - 500)');

    // -------------------------------------------------------------
    // TEST SUITE 5: Second Partial & Final Payment to PAID Status
    // -------------------------------------------------------------
    console.log('\n[Suite 5] Second Partial & Final Payment to PAID Status');
    const pay2 = await PaymentService.recordPayment({
      billId: bill._id,
      amount: 400,
      paymentMethod: 'CASH',
      user: mockAdmin,
    });

    const billAfterPay2 = await Bill.findById(bill._id);
    assert(billAfterPay2.totalPaid === 900, 'Total paid updated to ₹900 (500 + 400)');
    assert(billAfterPay2.outstandingAmount === 200, 'Outstanding balance is ₹200 (1100 - 900)');
    assert(billAfterPay2.paymentStatus === PAYMENT_STATUSES.PARTIALLY_PAID, 'Status remains PARTIALLY_PAID');

    // Final Payment
    const pay3 = await PaymentService.recordPayment({
      billId: bill._id,
      amount: 200,
      paymentMethod: 'CARD',
      user: mockAdmin,
    });

    const billFinal = await Bill.findById(bill._id);
    assert(billFinal.totalPaid === 1100, 'Total paid equals grandTotal (₹1,100)');
    assert(billFinal.outstandingAmount === 0, 'Outstanding balance is ₹0');
    assert(billFinal.paymentStatus === PAYMENT_STATUSES.PAID, 'Status updated to PAID');

    // -------------------------------------------------------------
    // TEST SUITE 6: Multi-Payment Ledger & Mathematical Integrity
    // -------------------------------------------------------------
    console.log('\n[Suite 6] Multi-Payment Ledger & Mathematical Integrity');
    const payments = await Payment.find({ billId: bill._id });
    assert(payments.length === 3, '3 independent Payment records preserved');

    const sumPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    assert(sumPayments === billFinal.totalPaid, `Sum of Payment collection (₹${sumPayments}) exactly matches Bill.totalPaid (₹${billFinal.totalPaid})`);
    assert(billFinal.grandTotal - sumPayments === billFinal.outstandingAmount, 'Bill.grandTotal - SUM(Payment.amount) exactly equals Bill.outstandingAmount (₹0)');

    // Rejection of payment on already PAID bill
    let paidErr = false;
    try {
      await PaymentService.recordPayment({
        billId: bill._id,
        amount: 100,
        paymentMethod: 'CASH',
        user: mockAdmin,
      });
    } catch (err) {
      paidErr = true;
      assert(err.message.includes('cannot exceed outstanding balance'), `Payment on PAID bill rejected: "${err.message}"`);
    }
    assert(paidErr === true, 'Payment attempt on fully paid bill blocked');

    console.log(`\n================================================================`);
    console.log(`  PHASE 9 COMPLETE: ALL BILLING & INVOICING TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase9Tests().catch((err) => {
  console.error('Phase 9 Test Suite Failed:', err);
  process.exit(1);
});
