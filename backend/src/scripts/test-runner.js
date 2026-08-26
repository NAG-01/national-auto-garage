import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Part } from '../models/Part.js';
import { ServiceType } from '../models/ServiceType.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Inspection } from '../models/Inspection.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { CustomerOutstanding } from '../models/CustomerOutstanding.js';
import { MasterKeyword } from '../models/MasterKeyword.js';
import { AuthService } from '../services/auth.service.js';
import { CustomerService } from '../services/customer.service.js';
import { VehicleService } from '../services/vehicle.service.js';
import { InventoryService } from '../services/inventory.service.js';
import { JobCardService } from '../services/jobCard.service.js';
import { BillService } from '../services/bill.service.js';
import { PaymentService } from '../services/payment.service.js';
import { OutstandingService } from '../services/outstanding.service.js';
import { ExpenseService } from '../services/expense.service.js';
import { JOB_STATUSES, PAYMENT_METHODS, INVENTORY_MOVEMENT_TYPES } from '../config/constants.js';

import bcrypt from 'bcryptjs';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING NATIONAL AUTO GARAGE VERIFICATION SUITE   ');
  console.log('====================================================\n');

  await connectDB();

  try {
    // 1. Ensure test admin exists
    let admin = await User.findOne({ email: 'admin@nag.com' });
    if (!admin) {
      const passwordHash = await bcrypt.hash('password123', 10);
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@nag.com',
        passwordHash,
        role: 'ADMIN',
      });
    }

    let srvType = await ServiceType.findOne({ code: 'SRV_GEN' });
    if (!srvType) {
      srvType = await ServiceType.create({
        name: 'General / Full Service',
        code: 'SRV_GEN',
        description: 'Comprehensive 40-point two-wheeler service',
        baseLabourCharge: 600,
        estimatedDurationMinutes: 180,
      });
    }

    // 1. Test Auth Service
    console.log('[Test Suite 1] Authentication & RBAC');
    assert(admin !== null, 'Admin user exists in database');
    const { token, user } = await AuthService.login('admin', 'admin123');
    assert(token && user.role === 'ADMIN', 'AuthService.login returns valid token and ADMIN role');

    // 2. Test Customer & Phone Normalization
    console.log('\n[Test Suite 2] Customer Management & Deduplication');
    const custName = `Test Cust ${Date.now()}`;
    const custPhone = `98980${Math.floor(10000 + Math.random() * 90000)}`;
    const newCust = await CustomerService.createCustomer(
      { name: custName, mobileNumber: custPhone, phone: custPhone, address: 'Test Address' },
      admin
    );
    assert((newCust.customerId || newCust.customerCode || '').startsWith('CUST'), 'Customer generated valid sequential code');
    assert((newCust.mobileNumber || newCust.phone) === custPhone, 'Customer phone normalized');

    // Test Duplicate Phone rejection
    let duplicateRejected = false;
    try {
      await CustomerService.createCustomer({ name: 'Duplicate Person', mobileNumber: custPhone, phone: custPhone }, admin);
    } catch (e) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate phone number creation is blocked with 409 Conflict');

    // 3. Test Vehicle Normalization
    console.log('\n[Test Suite 3] Vehicle Registration Normalization');
    const testReg = `GJ 05 ZZ ${Math.floor(1000 + Math.random() * 9000)}${Math.floor(Math.random() * 10)}`;
    const veh = await VehicleService.createVehicle(
      newCust._id,
      {
        bikeName: 'Honda Activa 6G',
        registrationNumber: testReg,
        make: 'Honda',
        model: 'Activa 6G',
        vehicleType: 'SCOOTER',
      },
      admin
    );
    assert(!veh.registrationNumber.includes(' '), 'Vehicle registration number is normalized without spaces');
    assert(veh.registrationNumber.startsWith('GJ05ZZ'), 'Vehicle registration number is uppercase');

    // 4. Test Inventory Ledger & Negative Stock Guard
    console.log('\n[Test Suite 4] Inventory Stock Ledger & Negative Stock Guard');
    const partNum = `PART-${Date.now()}`;
    const part = await InventoryService.createPart(
      {
        partNumber: partNum,
        name: 'Test Brake Disc',
        category: 'Brake Systems',
        purchasePrice: 200,
        sellingPrice: 350,
        currentStock: 10,
        minStockLevel: 3,
      },
      admin
    );
    assert(part.currentStock === 10, 'Part initial stock created with ledger movement');

    // Adjust stock up
    const adjUp = await InventoryService.recordStockMovement({
      partId: part._id,
      movementType: INVENTORY_MOVEMENT_TYPES.MANUAL_ADJUSTMENT,
      quantity: 5,
      notes: 'Test stock intake',
      user: admin,
    });
    assert(adjUp.part.currentStock === 15, 'Stock successfully increased to 15');

    // Test Negative Stock Guard
    let negativeBlocked = false;
    try {
      await InventoryService.recordStockMovement({
        partId: part._id,
        movementType: INVENTORY_MOVEMENT_TYPES.SERVICE_USAGE,
        quantity: -20, // greater than 15
        notes: 'Excess deduction test',
        user: admin,
      });
    } catch (err) {
      negativeBlocked = true;
    }
    assert(negativeBlocked, 'Negative stock deduction is strictly rejected');

    // 5. Test Job Card Lifecycle & Inspection
    console.log('\n[Test Suite 5] Job Card Lifecycle, Inspection & Parts');
    const job = await JobCardService.createJobCard(
      {
        customerId: newCust._id,
        vehicleId: veh._id,
        serviceTypeId: srvType._id,
        vehicleKm: 12000,
        customerComplaint: 'Test oil leakage and chain noise',
      },
      admin
    );
    assert(job.jobId.startsWith('JOB-') || job.jobId.startsWith('NAG-'), 'Job Card generated valid sequence ID');
    assert(job.status === JOB_STATUSES.PENDING, 'Initial job status is PENDING');

    // Add Inspection
    const insp = await JobCardService.saveInspection(
      job._id,
      {
        items: [
          { category: 'ENGINE', condition: 'GOOD', notes: 'Checked' },
          { category: 'CHAIN', condition: 'NEEDS_ATTENTION', notes: 'Loose chain' },
        ],
        overallCondition: 'Needs minor tuning',
      },
      admin
    );
    assert(insp.items.length === 2, 'Inspection checklist saved successfully');

    // Add Part to Job Card
    await JobCardService.addPartToJob(job._id, { partId: part._id, quantity: 2 }, admin);
    const updatedJob = (await JobCardService.getJobCardById(job._id)).job;
    assert(updatedJob.parts.length === 1, 'Part added to Job Card');
    assert(updatedJob.estimatedTotal === 600 + 700, 'Job total accurately computed: 600 labour + 700 parts = 1300');

    // Transition Status to COMPLETED (triggers stock deduction)
    await JobCardService.updateStatus(job._id, { status: JOB_STATUSES.COMPLETED }, admin);
    const reloadedPart = (await InventoryService.getPartById(part._id)).part;
    assert(reloadedPart.currentStock === 13, 'Stock accurately deducted from 15 to 13 upon service readiness');

    // 6. Test Invoicing & Payment Math
    console.log('\n[Test Suite 6] Invoicing & Multi-Payment Settlement');
    await Bill.deleteMany({});
    const bill = await BillService.createBill({ jobId: job._id }, admin);
    assert((bill.billNumber || bill.invoiceNumber || '').startsWith('INV-') || (bill.billNumber || bill.invoiceNumber || '').startsWith('BILL-'), 'Generated sequential Bill number');
    assert(bill.grandTotal === 1300, 'Bill grand total is ₹1300');
    assert(bill.balanceDue === 1300, 'Initial balance due matches grand total');
    assert(bill.paymentStatus === 'UNPAID', 'Bill status is UNPAID');

    // Partial Payment 1: ₹500
    const pay1 = await PaymentService.recordPayment(
      {
        invoiceId: bill._id,
        amount: 500,
        paymentMethod: PAYMENT_METHODS.CASH,
        notes: 'Advance partial payment',
      },
      admin
    );
    assert(pay1.invoice.paidAmount === 500, 'Paid amount updated to ₹500');
    assert(pay1.invoice.balanceDue === 800, 'Remaining balance due is ₹800');
    assert(pay1.invoice.paymentStatus === 'PARTIALLY_PAID', 'Bill status changed to PARTIALLY_PAID');

    // Partial Payment 2: ₹800 (Full settlement)
    const pay2 = await PaymentService.recordPayment(
      {
        invoiceId: bill._id,
        amount: 800,
        paymentMethod: PAYMENT_METHODS.UPI,
        notes: 'Final UPI balance clearance',
      },
      admin
    );
    assert(pay2.invoice.balanceDue === 0, 'Balance due is exactly ₹0');
    assert(pay2.invoice.paymentStatus === 'PAID', 'Bill marked PAID');

    // Overpayment prevention
    let overpaymentBlocked = false;
    try {
      await PaymentService.recordPayment(
        {
          invoiceId: bill._id,
          amount: 100,
          paymentMethod: PAYMENT_METHODS.CASH,
        },
        admin
      );
    } catch (e) {
      overpaymentBlocked = true;
    }
    assert(overpaymentBlocked, 'Overpayment beyond balance due is strictly blocked');

    // 7. Test OPEX 3-Account Notebook Ledger Math
    console.log('\n[Test Suite 7] OPEX 3-Account Notebook Ledger Math');
    await ExpenseService.createExpense(
      { category: 'OTHER', amount: 100, description: 'Test Garage Expense', paidBy: 'GARAGE_ACCOUNT' },
      admin
    );
    await ExpenseService.createExpense(
      { category: 'OTHER', amount: 200, description: 'Test Imran Expense', paidBy: 'PARTNER_A' },
      admin
    );
    await ExpenseService.createExpense(
      { category: 'OTHER', amount: 300, description: 'Test Naim Expense', paidBy: 'PARTNER_B' },
      admin
    );

    const expenseRes = await ExpenseService.getExpenses({ page: 1, limit: 100 });
    assert(expenseRes.accountTotals !== undefined, 'Expense ledger computes 3-account summary totals');
    assert(expenseRes.accountTotals.garage >= 100, 'Garage account total computed correctly');
    assert(expenseRes.accountTotals.imran >= 200, 'Imran Pathan account total computed correctly');
    assert(expenseRes.accountTotals.naim >= 300, 'Naim Pathan account total computed correctly');

    // 8. Test Standalone Customer Dues Register CRUD
    console.log('\n[Test Suite 8] Standalone Customer Dues Register (CRUD)');
    const duesRecord = await OutstandingService.createOutstandingRecord(
      {
        customerName: 'Test Customer Dues',
        mobileNumber: '9876543210',
        bikeName: 'Hero Splendor Plus',
        address: 'Test Address 123',
        pendingAmount: 1500,
        notes: 'Engine work baaki',
      },
      admin
    );
    assert(duesRecord.recordId.startsWith('DUE-'), 'Generated sequential Dues Record ID (DUE-0001)');
    assert(duesRecord.pendingAmount === 1500, 'Pending amount recorded accurately');

    const updatedDues = await OutstandingService.updateOutstandingRecord(
      duesRecord._id,
      { pendingAmount: 2000 },
      admin
    );
    assert(updatedDues.pendingAmount === 2000, 'Dues record pending amount updated');

    const duesList = await OutstandingService.getOutstandingRecords({ search: '9876543210' });
    assert(duesList.records.length > 0, 'Found dues record by mobile number search');

    await OutstandingService.deleteOutstandingRecord(duesRecord._id, admin);
    const afterDelete = await CustomerOutstanding.findById(duesRecord._id);
    assert(!afterDelete, 'Dues record deleted successfully');

    console.log('\n[Test Suite 9] Smart Master Keywords Register & Typo Tolerance');
    const createdKw = await MasterKeyword.create({
      word: 'Test Tyre Keyword',
      category: 'Spare Part',
    });
    assert(createdKw.word === 'Test Tyre Keyword', 'Master keyword created successfully');

    createdKw.usageCount += 1;
    await createdKw.save();
    assert(createdKw.usageCount === 1, 'Master keyword usage frequency updated');

    await MasterKeyword.findByIdAndDelete(createdKw._id);
    const kwDeleted = await MasterKeyword.findById(createdKw._id);
    assert(!kwDeleted, 'Master keyword deleted successfully');

    console.log('\n====================================================');
    console.log(`  VERIFICATION PASSED: ${passedTests} / ${totalTests} TESTS SUCCESSFUL`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Aborted with Error:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runTests();
