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

async function runPhase8Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 8 ENGINE JOBS MODULE TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Product.deleteMany({});
    await ServiceJob.deleteMany({});
    await InventoryMovement.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    // Setup Test Baseline: Customer, Vehicle, Engine Spare Parts
    const cust = await CustomerService.createCustomer({
      name: 'Nilesh Patel',
      mobileNumber: '9909099090',
    }, mockAdmin);

    const veh = await VehicleService.createVehicle(cust._id, {
      bikeName: 'Pulsar 220 DTS-i',
      registrationNumber: 'GJ05EF9999',
      currentKm: 45000,
    }, mockAdmin);

    const prodPiston = await Product.create({
      productId: 'PRD-0010',
      name: 'Pulsar 220 Piston & Cylinder Kit',
      category: 'SPARE_PARTS',
      currentStock: 3,
      minimumStockLevel: 1,
      sellingPrice: 3200,
      purchaseCost: 2400,
    });

    const prodValves = await Product.create({
      productId: 'PRD-0011',
      name: 'Engine Valves Set (Inlet + Exhaust)',
      category: 'SPARE_PARTS',
      currentStock: 4,
      minimumStockLevel: 1,
      sellingPrice: 850,
      purchaseCost: 600,
    });

    // -------------------------------------------------------------
    // TEST SUITE 1: Engine Job Creation & Sequence ID
    // -------------------------------------------------------------
    console.log('[Suite 1] Engine Job Creation & Atomic ID Generation');
    const engineJob1 = await JobCardService.createJob({
      customerId: cust._id,
      vehicleId: veh._id,
      serviceType: JOB_TYPES.ENGINE_JOB,
      serviceDetails: 'Complete engine overhaul: Piston-cylinder replacement, valve grinding, and new oil seals.',
      items: [
        { productId: prodPiston._id, quantity: 1 },
        { productId: prodValves._id, quantity: 1 },
      ],
      labourCharges: 1500,
    }, mockAdmin);

    assert(engineJob1.jobId.startsWith('JOB-') || engineJob1.jobId.includes('-'), `Engine Job ID generated: ${engineJob1.jobId}`);
    assert(engineJob1.serviceType === JOB_TYPES.ENGINE_JOB, 'Service type correctly recorded as ENGINE_JOB');
    assert(engineJob1.status === JOB_STATUSES.PENDING, 'Engine Job initialized as PENDING');
    assert(engineJob1.isStockDeducted === false, 'Stock is NOT deducted on job creation');

    // -------------------------------------------------------------
    // TEST SUITE 2: Financial Calculations & Historical Price Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Financial Calculations & Historical Price Protection');
    assert(engineJob1.items.length === 2, '2 engine spare parts attached to job');
    assert(engineJob1.items[0].unitPriceSnapshot === 3200, 'Piston kit unit price snapshotted (₹3,200)');
    assert(engineJob1.items[1].unitPriceSnapshot === 850, 'Valves set unit price snapshotted (₹850)');
    assert(engineJob1.partsTotal === 4050, 'Parts total calculated: 3200 + 850 = ₹4,050');
    assert(engineJob1.labourCharges === 1500, 'Engine overhaul labour charges set: ₹1,500');
    assert(engineJob1.grandTotal === 5550, 'Grand total calculated: 4050 + 1500 = ₹5,550');

    // Master Product Price Change Test
    prodPiston.sellingPrice = 3600;
    await prodPiston.save();

    const fetchEngineJob = await JobCardService.getJobById(engineJob1._id);
    assert(fetchEngineJob.items[0].unitPriceSnapshot === 3200, 'Historical price snapshot remains ₹3,200 even after catalog price raised to ₹3,600');
    assert(fetchEngineJob.grandTotal === 5550, 'Historical grand total remains ₹5,550');

    prodPiston.sellingPrice = 3200;
    await prodPiston.save();

    // -------------------------------------------------------------
    // TEST SUITE 3: Stock Deductions Invariant (PENDING & IN_PROGRESS)
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Stock Deductions Invariant');
    const pPiston1 = await Product.findById(prodPiston._id);
    assert(pPiston1.currentStock === 3, 'PENDING Engine Job does NOT deduct stock (remains 3)');

    await JobCardService.updateJobStatus(engineJob1._id, JOB_STATUSES.IN_PROGRESS, mockAdmin);
    const pPiston2 = await Product.findById(prodPiston._id);
    assert(pPiston2.currentStock === 3, 'IN_PROGRESS Engine Job does NOT deduct stock (remains 3)');

    // -------------------------------------------------------------
    // TEST SUITE 4: Insufficient Stock Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Insufficient Stock Protection');
    const jobExcessEngine = await JobCardService.createJob({
      customerId: cust._id,
      vehicleId: veh._id,
      serviceType: JOB_TYPES.ENGINE_JOB,
      serviceDetails: 'Excess engine parts test',
      items: [{ productId: prodPiston._id, quantity: 5 }], // Piston stock is 3!
    }, mockAdmin);

    let excessError = false;
    try {
      await JobCardService.updateJobStatus(jobExcessEngine._id, JOB_STATUSES.COMPLETED, mockAdmin);
    } catch (err) {
      excessError = true;
      assert(err.message.includes('Insufficient stock'), `Backend rejected excess engine stock: "${err.message}"`);
    }
    assert(excessError === true, 'Excess engine stock request blocked atomically');

    // -------------------------------------------------------------
    // TEST SUITE 5: COMPLETED Status Atomic Stock Deduction & Ledger
    // -------------------------------------------------------------
    console.log('\n[Suite 5] COMPLETED Status Atomic Stock Deduction & Idempotency');
    await JobCardService.updateJobStatus(engineJob1._id, JOB_STATUSES.COMPLETED, mockAdmin);

    const pPistonDone = await Product.findById(prodPiston._id);
    const pValvesDone = await Product.findById(prodValves._id);
    assert(pPistonDone.currentStock === 2, 'Piston stock decreased by 1 (3 -> 2)');
    assert(pValvesDone.currentStock === 3, 'Valves stock decreased by 1 (4 -> 3)');

    const doneJob = await JobCardService.getJobById(engineJob1._id);
    assert(doneJob.isStockDeducted === true, 'isStockDeducted set to true');

    const ledgers = await InventoryMovement.find({ referenceId: engineJob1.jobId });
    assert(ledgers.length === 2, '2 InventoryMovement ledger entries recorded for engine job');
    assert(ledgers[0].movementType === 'SERVICE_USAGE', 'Ledger movement type is SERVICE_USAGE');

    // Idempotency check on status transition to DELIVERED
    await JobCardService.updateJobStatus(engineJob1._id, JOB_STATUSES.DELIVERED, mockAdmin);
    const pPistonDelivered = await Product.findById(prodPiston._id);
    assert(pPistonDelivered.currentStock === 2, 'DELIVERED status does NOT double deduct stock (remains 2)');

    // -------------------------------------------------------------
    // TEST SUITE 6: Cancellation & Stock Restoration
    // -------------------------------------------------------------
    console.log('\n[Suite 6] Engine Job Cancellation & Stock Restoration');
    const jobToCancel = await JobCardService.createJob({
      customerId: cust._id,
      vehicleId: veh._id,
      serviceType: JOB_TYPES.ENGINE_JOB,
      serviceDetails: 'Engine repair to cancel',
      items: [{ productId: prodValves._id, quantity: 2 }],
    }, mockAdmin);

    await JobCardService.updateJobStatus(jobToCancel._id, JOB_STATUSES.COMPLETED, mockAdmin);
    const pValvesSub = await Product.findById(prodValves._id);
    assert(pValvesSub.currentStock === 1, 'Valves stock deducted to 1 (3 -> 1)');

    await JobCardService.updateJobStatus(jobToCancel._id, JOB_STATUSES.CANCELLED, mockAdmin);
    const pValvesRestored = await Product.findById(prodValves._id);
    assert(pValvesRestored.currentStock === 3, 'Cancelled Engine Job restored valves stock back to 3');

    // -------------------------------------------------------------
    // TEST SUITE 7: Engine Job Service History Query Integration
    // -------------------------------------------------------------
    console.log('\n[Suite 7] Customer & Vehicle Service History Ledger Integration');
    const custProfile = await CustomerService.getCustomerById(cust._id);
    assert(custProfile.serviceHistory.length === 3, 'Customer profile returns all 3 engine jobs');

    const vehProfile = await VehicleService.getVehicleById(veh._id);
    assert(vehProfile.serviceHistory.length === 3, 'Vehicle profile returns all 3 engine jobs');

    // Query list by serviceType
    const engineJobsList = await JobCardService.getJobs({ serviceType: JOB_TYPES.ENGINE_JOB });
    assert(engineJobsList.jobs.length === 3, 'Filtered jobs list returns 3 Engine Jobs');

    console.log(`\n================================================================`);
    console.log(`  PHASE 8 COMPLETE: ALL ENGINE JOBS MODULE TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase8Tests().catch((err) => {
  console.error('Phase 8 Test Suite Failed:', err);
  process.exit(1);
});
