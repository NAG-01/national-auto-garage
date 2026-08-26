import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { PaymentService } from '../services/payment.service.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { PAYMENT_STATUSES, PAYMENT_METHODS, JOB_TYPES, JOB_STATUSES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPaymentIntegrityTests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PAYMENT & OUTSTANDING DATA INTEGRITY`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Bill.deleteMany({});
    await Payment.deleteMany({});
    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await ServiceJob.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    const customer = await Customer.create({
      customerId: 'CUST-0001',
      name: 'Ramesh Kumar',
      mobileNumber: '9876543210',
    });

    const vehicle = await Vehicle.create({
      vehicleId: 'VEH-0001',
      customerId: customer._id,
      bikeName: 'Honda Activa 6G',
      registrationNumber: 'GJ05AB1234',
      make: 'Honda',
      model: 'Activa 6G',
    });

    const job = await ServiceJob.create({
      jobId: 'NAG-2026-0001',
      serviceType: JOB_TYPES.FULL_SERVICE,
      customerId: customer._id,
      vehicleId: vehicle._id,
      customerNameSnapshot: customer.name,
      mobileNumberSnapshot: customer.mobileNumber,
      bikeNameSnapshot: 'Honda Activa 6G',
      serviceDetails: 'Full service tuning and oil change',
      status: JOB_STATUSES.COMPLETED,
    });

    // Step 1: Create Bill = ₹2,000
    console.log('[Step 1] Creating a test Bill with Grand Total = ₹2,000');
    const billNumber = await generateNextSequence('INV');
    const bill = await Bill.create({
      billNumber,
      jobId: job._id,
      customerId: customer._id,
      vehicleId: vehicle._id,
      customerName: customer.name,
      mobileNumber: customer.mobileNumber,
      bikeName: 'Honda Activa 6G',
      serviceType: 'Full Service',
      grandTotal: 2000,
      totalPaid: 0,
      outstandingAmount: 2000,
      paymentStatus: PAYMENT_STATUSES.UNPAID,
    });

    assert(bill.grandTotal === 2000, 'Bill Grand Total is ₹2,000');
    assert(bill.outstandingAmount === 2000, 'Initial Outstanding Amount is ₹2,000');
    assert(bill.paymentStatus === PAYMENT_STATUSES.UNPAID, 'Initial Payment Status is UNPAID');

    // Step 2: Record Payment 1 = ₹500 and Payment 2 = ₹500
    console.log('\n[Step 2] Recording Payment 1 = ₹500 and Payment 2 = ₹500');
    const pay1 = await PaymentService.recordPayment({
      billId: bill._id,
      amount: 500,
      paymentMethod: PAYMENT_METHODS.CASH,
      notes: 'First installment',
      user: mockAdmin,
    });

    assert(pay1.bill.totalPaid === 500, 'After Payment 1: Total Paid is ₹500');
    assert(pay1.bill.outstandingAmount === 1500, 'After Payment 1: Outstanding is ₹1,500');
    assert(pay1.bill.paymentStatus === PAYMENT_STATUSES.PARTIALLY_PAID, 'After Payment 1: Status is PARTIALLY_PAID');

    const pay2 = await PaymentService.recordPayment({
      billId: bill._id,
      amount: 500,
      paymentMethod: PAYMENT_METHODS.UPI,
      notes: 'Second installment',
      user: mockAdmin,
    });

    assert(pay2.bill.totalPaid === 1000, 'After Payment 2: Total Paid is ₹1,000 (500 + 500)');
    assert(pay2.bill.outstandingAmount === 1000, 'After Payment 2: Outstanding is ₹1,000 (2000 - 1000)');
    assert(pay2.bill.paymentStatus === PAYMENT_STATUSES.PARTIALLY_PAID, 'After Payment 2: Status remains PARTIALLY_PAID');

    // Step 3: Record Payment 3 = ₹1,000
    console.log('\n[Step 3] Recording Payment 3 = ₹1,000 (Full Settlement)');
    const pay3 = await PaymentService.recordPayment({
      billId: bill._id,
      amount: 1000,
      paymentMethod: PAYMENT_METHODS.CASH,
      notes: 'Final settlement',
      user: mockAdmin,
    });

    assert(pay3.bill.totalPaid === 2000, 'After Payment 3: Total Paid is ₹2,000');
    assert(pay3.bill.outstandingAmount === 0, 'After Payment 3: Outstanding is ₹0');
    assert(pay3.bill.paymentStatus === PAYMENT_STATUSES.PAID, 'After Payment 3: Status is marked PAID');

    // Step 4: Verifying Payment Collection Invariant & Immutability
    console.log('\n[Step 4] Verifying Payment Collection Invariant & Immutability');
    const paymentRecords = await Payment.find({ billId: bill._id });
    assert(paymentRecords.length === 3, 'All 3 independent Payment documents exist in Payment collection');
    assert(paymentRecords[0].amount === 500, 'Payment Record 1 preserved: ₹500');
    assert(paymentRecords[1].amount === 500, 'Payment Record 2 preserved: ₹500');
    assert(paymentRecords[2].amount === 1000, 'Payment Record 3 preserved: ₹1,000');

    const totalPaidSum = paymentRecords.reduce((sum, p) => sum + p.amount, 0);
    assert(totalPaidSum === 2000, 'Authoritative sum of Payment collection exactly equals ₹2,000');
    assert(pay3.bill.totalPaid === totalPaidSum, 'Bill.totalPaid strictly matches Payment collection sum');
    assert(pay3.bill.outstandingAmount === 2000 - totalPaidSum, 'Bill.outstandingAmount strictly matches 2000 - 2000 = 0');

    // Step 5: Overpayment Rejection
    console.log('\n[Step 5] Testing Overpayment Rejection (Bill = ₹2,000, Existing = ₹1,500, Attempt = ₹600)');
    const job2 = await ServiceJob.create({
      jobId: 'NAG-2026-0002',
      serviceType: JOB_TYPES.FULL_SERVICE,
      customerId: customer._id,
      vehicleId: vehicle._id,
      customerNameSnapshot: customer.name,
      mobileNumberSnapshot: customer.mobileNumber,
      bikeNameSnapshot: 'Honda Activa 6G',
      serviceDetails: 'Full service overhaul',
      status: JOB_STATUSES.COMPLETED,
    });
    const bill2Number = await generateNextSequence('INV');
    const bill2 = await Bill.create({
      billNumber: bill2Number,
      jobId: job2._id,
      customerId: customer._id,
      vehicleId: vehicle._id,
      customerName: customer.name,
      mobileNumber: customer.mobileNumber,
      bikeName: 'Honda Activa 6G',
      serviceType: 'Full Service',
      grandTotal: 2000,
      totalPaid: 1500,
      outstandingAmount: 500,
      paymentStatus: PAYMENT_STATUSES.PARTIALLY_PAID,
    });
    await Payment.create({
      paymentId: await generateNextSequence('PAY'),
      billId: bill2._id,
      customerId: customer._id,
      amount: 1500,
      paymentMethod: PAYMENT_METHODS.CASH,
    });

    assert(bill2.outstandingAmount === 500, 'Current Outstanding is ₹500');

    let overpaymentBlocked = false;
    try {
      await PaymentService.recordPayment({
        billId: bill2._id,
        amount: 600,
        paymentMethod: PAYMENT_METHODS.CASH,
        user: mockAdmin,
      });
    } catch (err) {
      overpaymentBlocked = true;
      assert(err.message.includes('exceed outstanding balance'), `Backend strictly REJECTS payment of ₹600 when outstanding is ₹500`);
      console.log(`  ℹ️  Rejection message: "${err.message}"`);
    }
    assert(overpaymentBlocked === true, 'Overpayment rejected');

    const pRecords = await Payment.find({ billId: bill2._id });
    assert(pRecords.length === 1, 'Payment collection contains only the valid 1 payment record');
    assert(pRecords[0].amount === 1500, 'Payment record remains intact at ₹1,500');

    console.log(`\n================================================================`);
    console.log(`  VERIFICATION PASSED: 23 / 23 INTEGRITY CHECKS SUCCESSFUL!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPaymentIntegrityTests().catch((err) => {
  console.error('Payment Integrity Test Suite Failed:', err);
  process.exit(1);
});
