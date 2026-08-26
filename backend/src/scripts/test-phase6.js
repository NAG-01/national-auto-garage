import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { CustomerService } from '../services/customer.service.js';
import { VehicleService } from '../services/vehicle.service.js';
import { JOB_TYPES, JOB_STATUSES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase6Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 6 CUSTOMERS & BIKES TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await ServiceJob.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };

    // -------------------------------------------------------------
    // TEST SUITE 1: Customer Creation & Sequence ID Generation
    // -------------------------------------------------------------
    console.log('[Suite 1] Customer Creation & Sequence ID Generation');
    const cust1 = await CustomerService.createCustomer({
      name: '  Maaz Pathan  ',
      mobileNumber: '+91 98765-43210',
      address: 'Ring Road, Surat',
      notes: 'Regular customer',
    }, mockAdmin);

    assert(cust1.customerId.startsWith('CUST-'), `Customer ID generated: ${cust1.customerId}`);
    assert(cust1.name === 'Maaz Pathan', 'Whitespace trimmed from customer name');
    assert(cust1.mobileNumber === '9876543210', 'Mobile number normalized to 10-digit Indian standard');
    assert(cust1.isActive === true, 'Customer initialized as active');

    // -------------------------------------------------------------
    // TEST SUITE 2: Duplicate Mobile Number Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Duplicate Mobile Number Protection');
    let duplicateError = false;
    try {
      await CustomerService.createCustomer({
        name: 'Maaz Duplicate',
        mobileNumber: '98765 43210',
      }, mockAdmin);
    } catch (err) {
      duplicateError = true;
      assert(err.message.includes('already exists'), `Backend rejected duplicate mobile attempt: "${err.message}"`);
    }
    assert(duplicateError === true, 'Duplicate mobile number creation strictly blocked');

    // -------------------------------------------------------------
    // TEST SUITE 3: Customer Updates & Mobile Modification Rules
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Customer Updates & Unique Phone Check');
    const updatedCust1 = await CustomerService.updateCustomer(cust1._id, {
      name: 'Maaz Pathan Pvt Ltd',
      address: 'Udhna Darwaja, Surat',
    }, mockAdmin);

    assert(updatedCust1.name === 'Maaz Pathan Pvt Ltd', 'Customer name updated');
    assert(updatedCust1.address === 'Udhna Darwaja, Surat', 'Customer address updated');
    assert(updatedCust1.customerId === cust1.customerId, 'Customer ID remains immutable');

    // -------------------------------------------------------------
    // TEST SUITE 4: Soft Archiving & Restoring
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Customer Soft Archiving & Restoring');
    await CustomerService.archiveCustomer(cust1._id, mockAdmin);
    const archivedCust = await Customer.findById(cust1._id);
    assert(archivedCust.isActive === false, 'Customer soft archived (isActive = false)');

    const listActive = await CustomerService.getCustomers({ status: 'ACTIVE' });
    assert(listActive.customers.length === 0, 'Archived customer hidden from active list');

    await CustomerService.restoreCustomer(cust1._id, mockAdmin);
    const restoredCust = await Customer.findById(cust1._id);
    assert(restoredCust.isActive === true, 'Customer restored (isActive = true)');

    // -------------------------------------------------------------
    // TEST SUITE 5: Vehicle Creation & Sequence ID Generation
    // -------------------------------------------------------------
    console.log('\n[Suite 5] Vehicle Creation & Relationship');
    const veh1 = await VehicleService.createVehicle(cust1._id, {
      bikeName: 'Honda Activa 6G',
      registrationNumber: 'gj 05 ab 1234',
      currentKm: 12500,
      notes: 'Primary scooter',
    }, mockAdmin);

    assert(veh1.vehicleId.startsWith('VEH-'), `Vehicle ID generated: ${veh1.vehicleId}`);
    assert(veh1.registrationNumber === 'GJ05AB1234', 'Registration number normalized to uppercase alphanumeric');
    assert(veh1.customerId.toString() === cust1._id.toString(), 'Vehicle linked via customerId reference');

    // -------------------------------------------------------------
    // TEST SUITE 6: Duplicate Registration Number Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 6] Duplicate Registration Protection');
    let duplicateRegSame = false;
    try {
      await VehicleService.createVehicle(cust1._id, {
        bikeName: 'Honda Activa Duplicate',
        registrationNumber: 'GJ 05 AB 1234',
      }, mockAdmin);
    } catch (err) {
      duplicateRegSame = true;
      assert(err.message.includes('already registered to this customer'), `Same customer duplicate registration rejected: "${err.message}"`);
    }
    assert(duplicateRegSame === true, 'Duplicate registration for same customer blocked');

    // Second customer duplicate check
    const cust2 = await CustomerService.createCustomer({
      name: 'Imran Khan',
      mobileNumber: '9825098250',
    }, mockAdmin);

    let duplicateRegOther = false;
    try {
      await VehicleService.createVehicle(cust2._id, {
        bikeName: 'Activa Copy',
        registrationNumber: 'GJ05AB1234',
      }, mockAdmin);
    } catch (err) {
      duplicateRegOther = true;
      assert(err.message.includes('linked to another customer'), `Other customer duplicate registration rejected: "${err.message}"`);
    }
    assert(duplicateRegOther === true, 'Duplicate registration for different customer blocked');

    // Multiple blank registration numbers allowed
    const vehBlank1 = await VehicleService.createVehicle(cust1._id, { bikeName: 'Splendor Plus 1' }, mockAdmin);
    const vehBlank2 = await VehicleService.createVehicle(cust1._id, { bikeName: 'Splendor Plus 2' }, mockAdmin);
    assert(vehBlank1 && vehBlank2, 'Multiple bikes with empty registration numbers allowed');

    // -------------------------------------------------------------
    // TEST SUITE 7: Vehicle Odometer & Negative KM Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 7] Vehicle Odometer & Negative KM Guard');
    let negativeKmError = false;
    try {
      await VehicleService.createVehicle(cust1._id, {
        bikeName: 'Pulsar 220',
        currentKm: -500,
      }, mockAdmin);
    } catch (err) {
      negativeKmError = true;
      assert(err.message.includes('cannot be negative'), `Negative Odometer KM rejected: "${err.message}"`);
    }
    assert(negativeKmError === true, 'Negative currentKm rejected');

    // -------------------------------------------------------------
    // TEST SUITE 8: Customer & Vehicle Service History Read-Only Queries
    // -------------------------------------------------------------
    console.log('\n[Suite 8] Customer & Vehicle Service History Queries');
    const mockJob = await ServiceJob.create({
      jobId: 'NAG-2026-0001',
      serviceType: JOB_TYPES.FULL_SERVICE,
      customerId: cust1._id,
      vehicleId: veh1._id,
      customerNameSnapshot: cust1.name,
      mobileNumberSnapshot: cust1.mobileNumber,
      bikeNameSnapshot: veh1.bikeName,
      serviceDetails: 'Periodic maintenance & oil change',
      status: JOB_STATUSES.COMPLETED,
    });

    const custProfile = await CustomerService.getCustomerById(cust1._id);
    assert(custProfile.vehicles.length === 3, 'Customer profile returns all 3 linked bikes');
    assert(custProfile.serviceHistory.length === 1, 'Customer service history returns 1 ServiceJob record');
    assert(custProfile.serviceHistory[0].jobId === 'NAG-2026-0001', 'ServiceJob correctly linked via customerId');

    const vehProfile = await VehicleService.getVehicleById(veh1._id);
    assert(vehProfile.serviceHistory.length === 1, 'Vehicle profile returns 1 ServiceJob record');
    assert(vehProfile.serviceHistory[0].jobId === 'NAG-2026-0001', 'ServiceJob correctly linked via vehicleId');

    // -------------------------------------------------------------
    // TEST SUITE 9: Database Indexes Verification
    // -------------------------------------------------------------
    console.log('\n[Suite 9] Database Indexes Verification');
    const custIndexes = await Customer.collection.indexes();
    const custIndexKeys = custIndexes.map((idx) => Object.keys(idx.key)[0]);
    assert(custIndexKeys.includes('mobileNumber'), 'Customer collection indexed on mobileNumber');
    assert(custIndexKeys.includes('customerId'), 'Customer collection indexed on customerId');

    const vehIndexes = await Vehicle.collection.indexes();
    const vehIndexKeys = vehIndexes.map((idx) => Object.keys(idx.key)[0]);
    assert(vehIndexKeys.includes('customerId'), 'Vehicle collection indexed on customerId');
    assert(vehIndexKeys.includes('registrationNumber'), 'Vehicle collection indexed on registrationNumber');

    console.log(`\n================================================================`);
    console.log(`  PHASE 6 COMPLETE: ALL CUSTOMER & BIKE TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase6Tests().catch((err) => {
  console.error('Phase 6 Test Suite Failed:', err);
  process.exit(1);
});
