import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Employee } from '../models/Employee.js';
import { ServiceType } from '../models/ServiceType.js';
import { Supplier } from '../models/Supplier.js';
import { Part } from '../models/Part.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Expense } from '../models/Expense.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { CustomerOutstanding } from '../models/CustomerOutstanding.js';
import { Settings } from '../models/Settings.js';
import { Counter } from '../models/Counter.js';
import { MasterKeyword } from '../models/MasterKeyword.js';
import {
  ROLES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  INSPECTION_CATEGORIES,
  INSPECTION_CONDITIONS,
  PRODUCT_CATEGORIES,
} from '../config/constants.js';

export async function seedDatabase() {
  console.log('--- STARTING NAG SEEDING PROCESS ---');
  await connectDB();

  console.log('Clearing existing collection records...');
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    ServiceType.deleteMany({}),
    Supplier.deleteMany({}),
    Part.deleteMany({}),
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Vehicle.deleteMany({}),
    ServiceJob.deleteMany({}),
    Expense.deleteMany({}),
    Bill.deleteMany({}),
    Payment.deleteMany({}),
    Settings.deleteMany({}),
    Counter.deleteMany({}),
    CustomerOutstanding.deleteMany({}),
    MasterKeyword.deleteMany({}),
  ]);

  console.log('[1/10] Seeding Settings & Keywords...');
  await Settings.create({
    garageName: 'National Auto Garage',
    footerNote: 'Thank you for choosing National Auto Garage! Safe Riding.',
    tagline: 'Two-Wheeler Service & Repair Specialists',
    phone: '+91 98765 43210',
    email: 'contact@nationalautogarage.com',
    address: 'Shop No. 4, Garage Hub, Main Road, City',
    gstNumber: '24AAAAA0000A1Z5',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    invoicePrefix: 'INV',
    jobIdPrefix: 'NAG',
    inventoryCategories: [
      'Engine Parts',
      'Brake Systems',
      'Electrical & Lighting',
      'Filters & Plugs',
      'Oils & Lubricants',
      'Tyres & Tubes',
      'Chains & Sprockets',
      'Accessories',
    ],
    expenseCategories: Object.values(EXPENSE_CATEGORIES),
    paymentMethods: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'],
  });

  console.log('[2/10] Seeding Employees & Mechanics...');
  const mech1 = await Employee.create({
    employeeCode: 'EMP-001',
    name: 'Ramesh Kumar',
    role: 'MECHANIC',
    phone: '9876500001',
    salaryType: 'MONTHLY',
    baseSalary: 18000,
  });

  const mech2 = await Employee.create({
    employeeCode: 'EMP-002',
    name: 'Suresh Patel',
    role: 'MECHANIC',
    phone: '9876500002',
    salaryType: 'MONTHLY',
    baseSalary: 16000,
  });

  console.log('[3/10] Seeding Single Admin User...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await User.create({
    username: 'admin',
    email: 'admin@nag.com',
    passwordHash,
    role: ROLES.ADMIN,
  });

  console.log('[4/10] Seeding Service Types...');
  const engineService = await ServiceType.create({
    name: 'Engine Service',
    code: 'SRV_ENG',
    baseLabourCharge: 800,
    description: 'Complete engine diagnostics, oil replacement, valve clearance, and carburetor/injector tuning.',
  });

  const generalService = await ServiceType.create({
    name: 'General / Full Service',
    code: 'SRV_GEN',
    baseLabourCharge: 600,
    description: 'Comprehensive 10-point full body checkup, wash, chain lubrication, electrical check, brake tuning.',
  });

  console.log('[5/10] Seeding Suppliers & Spare Parts...');
  const supplier1 = await Supplier.create({
    supplierId: 'SUP-0001',
    supplierCode: 'SUP-0001',
    name: 'Metro Auto Spares & Lubricants',
    contactPerson: 'Harish Bhai',
    phone: '9898011223',
    email: 'metrospares@gmail.com',
    address: 'Near Old Bus Stand, Auto Market, City',
    gstNumber: '24BBBBB1111B1Z2',
    outstandingBalance: 12000,
  });

  const supplier2 = await Supplier.create({
    supplierId: 'SUP-0002',
    supplierCode: 'SUP-0002',
    name: 'Gujarat Genuine Two-Wheeler Parts',
    contactPerson: 'Mahesh Sharma',
    phone: '9898044556',
    email: 'gujaratparts@gmail.com',
    address: 'Ring Road, Spares Complex, City',
    gstNumber: '24CCCCC2222C1Z9',
    outstandingBalance: 5000,
  });

  const partOil = await Part.create({
    partNumber: 'MOT-10W30-4T',
    name: 'Motul 4T Plus 10W30 4T Engine Oil (900ml)',
    category: 'Oils & Lubricants',
    brand: 'Motul',
    compatibleModels: ['Hero Splendor', 'Honda Activa', 'Honda Shine', 'Bajaj Pulsar'],
    unit: 'LTR',
    purchasePrice: 320,
    sellingPrice: 420,
    currentStock: 24,
    minStockLevel: 6,
    maxStockLevel: 50,
    primarySupplierId: supplier1._id,
    rackLocation: 'Rack A-1',
  });

  const partPlug = await Part.create({
    partNumber: 'NGK-CR7HSA',
    name: 'NGK Spark Plug CR7HSA',
    category: 'Filters & Plugs',
    brand: 'NGK',
    compatibleModels: ['Honda Activa 4G/5G/6G', 'Hero Maestro', 'Hero Pleasure'],
    unit: 'PCS',
    purchasePrice: 95,
    sellingPrice: 140,
    currentStock: 18,
    minStockLevel: 5,
    maxStockLevel: 40,
    primarySupplierId: supplier2._id,
    rackLocation: 'Drawer B-2',
  });

  const partBrake = await Part.create({
    partNumber: 'BRK-PAD-ACT6G',
    name: 'Front Disc Brake Pad Set',
    category: 'Brake Systems',
    brand: 'Brembo / OEM',
    compatibleModels: ['Honda Activa 6G Disc', 'Honda Dio Disc', 'Hero Xtreme'],
    unit: 'SET',
    purchasePrice: 210,
    sellingPrice: 320,
    currentStock: 3, // Low stock on purpose to test alert
    minStockLevel: 5,
    maxStockLevel: 25,
    primarySupplierId: supplier2._id,
    rackLocation: 'Rack C-4',
  });

  console.log('[6/10] Seeding Customers & Vehicles...');
  const cust1 = await Customer.create({
    customerId: 'CUST-0001',
    customerCode: 'CUST-0001',
    name: 'Rajesh Varma',
    mobileNumber: '9898123456',
    phone: '9898123456',
    address: '12, Shanti Nagar, Ring Road, City',
  });

  const veh1 = await Vehicle.create({
    vehicleId: 'VEH-0001',
    customerId: cust1._id,
    bikeName: 'Honda Activa 6G',
    registrationNumber: 'GJ05AB1234',
    make: 'Honda',
    model: 'Activa 6G',
    variant: 'Standard',
    vehicleType: VEHICLE_TYPES.SCOOTER,
    manufacturingYear: 2022,
    currentKm: 14500,
  });

  const cust2 = await Customer.create({
    customerId: 'CUST-0002',
    customerCode: 'CUST-0002',
    name: 'Vikram Singh',
    mobileNumber: '9898654321',
    phone: '9898654321',
    address: '45, Gokul Society, City',
  });

  const veh2 = await Vehicle.create({
    vehicleId: 'VEH-0002',
    customerId: cust2._id,
    bikeName: 'Hero Splendor Plus',
    registrationNumber: 'GJ05CD5678',
    make: 'Hero',
    model: 'Splendor Plus',
    variant: 'i3S',
    vehicleType: VEHICLE_TYPES.MOTORCYCLE,
    manufacturingYear: 2021,
    currentKm: 28400,
  });

  console.log('[7/10] Seeding Job Cards & Invoices...');
  // Job 1: In Progress
  const job1 = await ServiceJob.create({
    jobId: 'NAG-2026-0001',
    serviceType: 'FULL_SERVICE',
    customerId: cust1._id,
    vehicleId: veh1._id,
    customerNameSnapshot: cust1.name,
    mobileNumberSnapshot: cust1.mobileNumber,
    bikeNameSnapshot: veh1.bikeName,
    bikeNumberSnapshot: veh1.registrationNumber,
    serviceDetails: 'Engine pickup low, periodic service due, mild squeaking front brake sound.',
    serviceTypeId: generalService._id,
    vehicleKm: 14500,
    customerComplaint: 'Engine pickup low, periodic service due, mild squeaking front brake sound.',
    priority: JOB_PRIORITIES.NORMAL,
    status: JOB_STATUSES.IN_PROGRESS,
    assignedMechanicId: mech1._id,
    parts: [
      {
        partId: partOil._id,
        partName: partOil.name,
        partNumber: partOil.partNumber,
        quantity: 1,
        unitPrice: 420,
        totalPrice: 420,
        isStockDeducted: false,
      },
    ],
    labourCharges: 600,
    partsSubtotal: 420,
    totalAmount: 1020,
    estimatedTotal: 1020,
  });

  // Job 2: Completed and Delivered with Invoice and Payment
  const job2 = await ServiceJob.create({
    jobId: 'NAG-2026-0002',
    serviceType: 'ENGINE_JOB',
    customerId: cust2._id,
    vehicleId: veh2._id,
    customerNameSnapshot: cust2.name,
    mobileNumberSnapshot: cust2.mobileNumber,
    bikeNameSnapshot: veh2.bikeName,
    bikeNumberSnapshot: veh2.registrationNumber,
    serviceDetails: 'Engine overheating on long ride, hard starting in morning.',
    serviceTypeId: engineService._id,
    vehicleKm: 28400,
    customerComplaint: 'Engine overheating on long ride, hard starting in morning.',
    priority: JOB_PRIORITIES.HIGH,
    status: JOB_STATUSES.DELIVERED,
    assignedMechanicId: mech2._id,
    deliveredAt: new Date(),
    parts: [
      {
        partId: partOil._id,
        partName: partOil.name,
        partNumber: partOil.partNumber,
        quantity: 1,
        unitPrice: 420,
        totalPrice: 420,
        isStockDeducted: true,
        deductedAt: new Date(),
      },
      {
        partId: partPlug._id,
        partName: partPlug.name,
        partNumber: partPlug.partNumber,
        quantity: 1,
        unitPrice: 140,
        totalPrice: 140,
        isStockDeducted: true,
        deductedAt: new Date(),
      },
    ],
    labourCharges: 800,
    partsSubtotal: 560,
    totalAmount: 1360,
    estimatedTotal: 1360,
  });

  const bill2 = await Bill.create({
    billNumber: 'NAG-INV-2026-0001',
    jobId: job2._id,
    customerId: cust2._id,
    vehicleId: veh2._id,
    customerName: cust2.name,
    mobileNumber: cust2.mobileNumber,
    bikeName: veh2.bikeName,
    bikeNumber: veh2.registrationNumber,
    serviceType: 'Engine Job',
    serviceDetails: job2.serviceDetails,
    items: [
      {
        productId: partOil._id,
        productName: partOil.name,
        quantity: 1,
        unitPrice: 420,
        total: 420,
      },
      {
        productId: partPlug._id,
        productName: partPlug.name,
        quantity: 1,
        unitPrice: 140,
        total: 140,
      },
    ],
    partsSubtotal: 560,
    labourCharges: 800,
    grandTotal: 1360,
    totalPaid: 1360,
    outstandingAmount: 0,
    paymentStatus: PAYMENT_STATUSES.PAID,
  });

  job2.billId = bill2._id;
  await job2.save();

  await Payment.create({
    paymentId: 'PAY-2026-0001',
    billId: bill2._id,
    customerId: cust2._id,
    amount: 1360,
    paymentMethod: PAYMENT_METHODS.UPI,
    paymentDate: new Date(),
    notes: 'Paid via GPay at delivery counter',
  });

  console.log('[8/10] Seeding Operating Expenses (OPEX)...');
  await BusinessExpense.create({
    expenseId: 'EXP-2026-0001',
    category: 'RENT',
    description: 'Monthly Garage Workshop Rent for current month',
    amount: 15000,
    paidBy: 'GARAGE_MONEY',
    date: new Date(),
  });

  await BusinessExpense.create({
    expenseId: 'EXP-2026-0002',
    category: 'ELECTRICITY',
    description: 'Electricity Bill payment (Air Compressor + Workshop lights)',
    amount: 2400,
    paidBy: 'IMRAN_PERSONAL',
    date: new Date(),
  });

  console.log('[9/10] Seeding Partner Transactions...');
  await PartnerTransaction.create({
    transactionId: 'PTX-2026-0001',
    partner: 'NAIM',
    type: 'PERSONAL_WITHDRAWAL',
    amount: 5000,
    source: 'GARAGE_MONEY',
    reason: 'Personal family withdrawal',
    date: new Date(),
  });

  await CustomerOutstanding.create({
    recordId: 'DUE-0001',
    date: new Date(),
    customerName: 'Rajesh Varma',
    mobileNumber: '9898123456',
    bikeName: 'Honda Activa 6G',
    address: '12, Shanti Nagar, Ring Road',
    pendingAmount: 1200,
    notes: 'Engine service & oil change dues',
  });

  await CustomerOutstanding.create({
    recordId: 'DUE-0002',
    date: new Date(),
    customerName: 'Suresh Patel',
    mobileNumber: '9876543210',
    bikeName: 'Hero Splendor Plus',
    address: 'Near Old Bus Stand, City',
    pendingAmount: 850,
    notes: 'Brake pad & wash dues',
  });

  const currentYear = new Date().getFullYear();
  await Promise.all([
    Counter.create({ _id: 'CUST', seq: 10 }),
    Counter.create({ _id: 'VEH', seq: 10 }),
    Counter.create({ _id: 'PRD', seq: 10 }),
    Counter.create({ _id: 'JOB', seq: 10 }),
    Counter.create({ _id: 'INV', seq: 10 }),
    Counter.create({ _id: `INV_${currentYear}`, seq: 10 }),
    Counter.create({ _id: 'EXP', seq: 10 }),
    Counter.create({ _id: `EXP_${currentYear}`, seq: 10 }),
    Counter.create({ _id: 'SUP', seq: 10 }),
    Counter.create({ _id: 'PAY', seq: 10 }),
    Counter.create({ _id: `PAY_${currentYear}`, seq: 10 }),
    Counter.create({ _id: 'DUE', seq: 10 }),
  ]);

  console.log('[10/10] ✅ Database seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Admin login: admin@nag.com / admin123');
  console.log('--------------------------------------------------');

  if (disconnectAfter) {
    await disconnectDB();
  }
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase(true).catch((err) => {
    console.error('Seed Error:', err);
    process.exit(1);
  });
}
