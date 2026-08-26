import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Product } from '../models/Product.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { JobCardService } from '../services/jobCard.service.js';
import { CustomerService } from '../services/customer.service.js';
import { VehicleService } from '../services/vehicle.service.js';
import { JOB_STATUSES, JOB_TYPES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase7Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 7 FULL SERVICE MODULE TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Product.deleteMany({});
    await ServiceJob.deleteMany({});
    await InventoryMovement.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    // Setup Test Baseline: Customer, Vehicles, and Products
    const cust1 = await CustomerService.createCustomer({
      name: 'Ramesh Patel',
      mobileNumber: '9898098980',
    }, mockAdmin);

    const cust2 = await CustomerService.createCustomer({
      name: 'Suresh Shah',
      mobileNumber: '9824098240',
    }, mockAdmin);

    const veh1 = await VehicleService.createVehicle(cust1._id, {
      bikeName: 'Honda Activa 6G',
      registrationNumber: 'GJ05AB1234',
      currentKm: 15000,
    }, mockAdmin);

    const veh2 = await VehicleService.createVehicle(cust2._id, {
      bikeName: 'TVS Jupiter',
      registrationNumber: 'GJ05CD5678',
    }, mockAdmin);

    const prodOil = await Product.create({
      productId: 'PRD-0001',
      name: 'Motul 4T 10W30 1L',
      category: 'OIL',
      currentStock: 10,
      minimumStockLevel: 2,
      sellingPrice: 450,
      purchaseCost: 350,
    });

    const prodBrake = await Product.create({
      productId: 'PRD-0002',
      name: 'Honda Original Brake Shoe',
      category: 'SPARE_PARTS',
      currentStock: 5,
      minimumStockLevel: 1,
      sellingPrice: 650,
      purchaseCost: 500,
    });

    // -------------------------------------------------------------
    // TEST SUITE 1: Job ID Generation & Customer/Vehicle Guard
    // -------------------------------------------------------------
    console.log('[Suite 1] Job Creation & Customer/Vehicle Ownership Verification');
    const job1 = await JobCardService.createJob({
      customerId: cust1._id,
      vehicleId: veh1._id,
      serviceDetails: 'Regular maintenance service & oil change',
      items: [{ productId: prodOil._id, quantity: 1 }],
      labourCharges: 350,
    }, mockAdmin);

    assert(job1.jobId.startsWith('JOB-') || job1.jobId.includes('-'), `Job ID generated atomically: ${job1.jobId}`);
    assert(job1.status === JOB_STATUSES.PENDING, 'New service job initialized as PENDING');
    assert(job1.isStockDeducted === false, 'Stock is NOT deducted on creation');

    // Mismatched vehicle guard
    let mismatchError = false;
    try {
      await JobCardService.createJob({
        customerId: cust1._id,
        vehicleId: veh2._id, // Belongs to cust2!
        serviceDetails: 'Mismatch test',
      }, mockAdmin);
    } catch (err) {
      mismatchError = true;
      assert(err.message.includes('does not belong to customer'), `Backend rejected mismatched vehicle: "${err.message}"`);
    }
    assert(mismatchError === true, 'Mismatched customer-vehicle relationship blocked');

    // -------------------------------------------------------------
    // TEST SUITE 2: Financial Calculations & Historical Price Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Financial Calculations & Historical Price Protection');
    assert(job1.items[0].productNameSnapshot === 'Motul 4T 10W30 1L', 'Product name snapshotted into job items');
    assert(job1.items[0].unitPriceSnapshot === 450, 'Unit price snapshotted (₹450)');
    assert(job1.partsTotal === 450, 'Parts total calculated: ₹450');
    assert(job1.labourCharges === 350, 'Labour charges set: ₹350');
    assert(job1.grandTotal === 800, 'Grand total calculated: 450 + 350 = ₹800');

    // Alter master Product price
    prodOil.sellingPrice = 550;
    await prodOil.save();

    const fetchJob1 = await JobCardService.getJobById(job1._id);
    assert(fetchJob1.items[0].unitPriceSnapshot === 450, 'Historical job price remains ₹450 after master price increased to ₹550');
    assert(fetchJob1.grandTotal === 800, 'Historical grand total remains ₹800');

    // Restore prodOil price
    prodOil.sellingPrice = 450;
    await prodOil.save();

    // -------------------------------------------------------------
    // TEST SUITE 3: Stock Deductions Invariant (PENDING & IN_PROGRESS)
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Stock Deductions Invariant');
    const p1 = await Product.findById(prodOil._id);
    assert(p1.currentStock === 10, 'PENDING job does NOT deduct stock (remains 10)');

    await JobCardService.updateJobStatus(job1._id, JOB_STATUSES.IN_PROGRESS, mockAdmin);
    const p2 = await Product.findById(prodOil._id);
    assert(p2.currentStock === 10, 'IN_PROGRESS job does NOT deduct stock (remains 10)');

    // -------------------------------------------------------------
    // TEST SUITE 4: Insufficient Stock Guard
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Insufficient Stock Guard');
    const jobExcess = await JobCardService.createJob({
      customerId: cust1._id,
      vehicleId: veh1._id,
      serviceDetails: 'Excess parts test',
      items: [{ productId: prodBrake._id, quantity: 10 }], // Brake stock is 5!
    }, mockAdmin);

    let excessError = false;
    try {
      await JobCardService.updateJobStatus(jobExcess._id, JOB_STATUSES.COMPLETED, mockAdmin);
    } catch (err) {
      excessError = true;
      assert(err.message.includes('Insufficient stock'), `Backend rejected excess stock request: "${err.message}"`);
    }
    assert(excessError === true, 'Insufficient stock request blocked atomically');

    // -------------------------------------------------------------
    // TEST SUITE 5: COMPLETED Status Atomic Stock Deduction & Ledger Logging
    // -------------------------------------------------------------
    console.log('\n[Suite 5] COMPLETED Status Atomic Stock Deduction & Idempotency');
    await JobCardService.updateJobStatus(job1._id, JOB_STATUSES.COMPLETED, mockAdmin);

    const p3 = await Product.findById(prodOil._id);
    assert(p3.currentStock === 9, 'Stock decreased by 1 (10 -> 9) upon COMPLETED status');

    const job1Done = await JobCardService.getJobById(job1._id);
    assert(job1Done.isStockDeducted === true, 'isStockDeducted flag set to true');

    const ledger = await InventoryMovement.findOne({ referenceId: job1.jobId });
    assert(ledger !== null, 'InventoryMovement ledger entry recorded');
    assert(ledger.movementType === 'SERVICE_USAGE', 'Movement type is SERVICE_USAGE');
    assert(ledger.quantity === -1, 'Movement quantity is -1');
    assert(ledger.previousStock === 10 && ledger.newStock === 9, 'Ledger stock delta is 10 -> 9');

    // Duplicate status update idempotency check
    await JobCardService.updateJobStatus(job1._id, JOB_STATUSES.DELIVERED, mockAdmin);
    const p4 = await Product.findById(prodOil._id);
    assert(p4.currentStock === 9, 'Re-running status to DELIVERED does NOT double deduct stock (remains 9)');

    // -------------------------------------------------------------
    // TEST SUITE 6: Cancellation & Stock Restoration
    // -------------------------------------------------------------
    console.log('\n[Suite 6] Job Cancellation & Stock Restoration');
    const jobCancelable = await JobCardService.createJob({
      customerId: cust1._id,
      vehicleId: veh1._id,
      serviceDetails: 'Brake replacement job',
      items: [{ productId: prodBrake._id, quantity: 2 }],
    }, mockAdmin);

    await JobCardService.updateJobStatus(jobCancelable._id, JOB_STATUSES.COMPLETED, mockAdmin);
    const pBrake1 = await Product.findById(prodBrake._id);
    assert(pBrake1.currentStock === 3, 'Brake stock deducted (5 -> 3)');

    await JobCardService.updateJobStatus(jobCancelable._id, JOB_STATUSES.CANCELLED, mockAdmin);
    const pBrake2 = await Product.findById(prodBrake._id);
    assert(pBrake2.currentStock === 5, 'Cancelled job restored stock back to 5');

    // -------------------------------------------------------------
    // TEST SUITE 7: Customer & Vehicle Service History Verification
    // -------------------------------------------------------------
    console.log('\n[Suite 7] Customer & Vehicle Service History Ledger Integration');
    const custProfile = await CustomerService.getCustomerById(cust1._id);
    assert(custProfile.serviceHistory.length === 3, 'Customer profile returns all 3 service jobs');

    const vehProfile = await VehicleService.getVehicleById(veh1._id);
    assert(vehProfile.serviceHistory.length === 3, 'Vehicle profile returns all 3 service jobs');

    console.log(`\n================================================================`);
    console.log(`  PHASE 7 COMPLETE: ALL FULL SERVICE MODULE TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase7Tests().catch((err) => {
  console.error('Phase 7 Test Suite Failed:', err);
  process.exit(1);
});
