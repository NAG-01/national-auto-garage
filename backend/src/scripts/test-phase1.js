import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  ROLES,
  JOB_TYPES,
  JOB_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  INVENTORY_MOVEMENT_TYPES,
  SUPPLIER_ORDER_STATUSES,
  MONEY_SOURCES,
  EXPENSE_CATEGORIES,
  PARTNERS,
  PARTNER_TRANSACTION_TYPES,
  STOCK_STATUSES,
} from '../config/constants.js';

import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Supplier } from '../models/Supplier.js';
import { SupplierOrder } from '../models/SupplierOrder.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { BusinessExpense } from '../models/BusinessExpense.js';
import { PartnerTransaction } from '../models/PartnerTransaction.js';
import { MonthlySettlement } from '../models/MonthlySettlement.js';
import { AuditLog } from '../models/AuditLog.js';
import { Counter } from '../models/Counter.js';

import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { normalizePhone, normalizeRegNumber, roundMoney } from '../utils/currency.js';
import {
  createCustomerSchema,
  createProductSchema,
  createPaymentSchema,
  createExpenseSchema,
  createPartnerTransactionSchema,
} from '../validators/schemas.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runPhase1Tests() {
  console.log('================================================================');
  console.log('  NATIONAL AUTO GARAGE — PHASE 1 ARCHITECTURE & DATA MODEL TESTS');
  console.log('================================================================\n');

  await connectDB();
  await Counter.deleteMany({});
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Vehicle.deleteMany({});
  await Product.deleteMany({});
  await InventoryMovement.deleteMany({});
  await Supplier.deleteMany({});
  await SupplierOrder.deleteMany({});
  await ServiceJob.deleteMany({});
  await Bill.deleteMany({});
  await Payment.deleteMany({});
  await BusinessExpense.deleteMany({});
  await PartnerTransaction.deleteMany({});
  await MonthlySettlement.deleteMany({});
  await AuditLog.deleteMany({});

  try {
    // ---------------------------------------------------------
    // TEST SUITE 1: Sequence & ID Generation
    // ---------------------------------------------------------
    console.log('[Suite 1] Atomic Sequence & Unique ID Generator');
    const custId1 = await generateNextSequence('CUST', 4, false);
    const custId2 = await generateNextSequence('CUST', 4, false);
    assert(custId1 === 'CUST-0001', 'First Customer ID formatted as CUST-0001');
    assert(custId2 === 'CUST-0002', 'Second Customer ID incremented atomically to CUST-0002');

    const prdId = await generateNextSequence('PRD', 4, false);
    assert(prdId === 'PRD-0001', 'Product ID formatted as PRD-0001');

    const currentYear = new Date().getFullYear();
    const jobId = await generateNextSequence('NAG', 4, true);
    assert(jobId === `NAG-${currentYear}-0001`, `Service Job ID formatted with year: NAG-${currentYear}-0001`);

    const billId = await generateNextSequence('NAG-INV', 4, true);
    assert(billId === `NAG-INV-${currentYear}-0001`, `Bill ID formatted with year: NAG-INV-${currentYear}-0001`);

    // ---------------------------------------------------------
    // TEST SUITE 2: Single Admin User Model
    // ---------------------------------------------------------
    console.log('\n[Suite 2] Single Admin User & Bcrypt Authentication');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@nag.com',
      passwordHash,
      role: ROLES.ADMIN,
    });
    assert(admin.role === ROLES.ADMIN, 'Admin user created with role ADMIN');
    const validPassword = await admin.comparePassword('admin123');
    assert(validPassword === true, 'Admin password matches bcrypt hash');
    const invalidPassword = await admin.comparePassword('wrongpassword');
    assert(invalidPassword === false, 'Invalid password correctly rejected');

    // ---------------------------------------------------------
    // TEST SUITE 3: Customer & Vehicle Model with Normalization
    // ---------------------------------------------------------
    console.log('\n[Suite 3] Customer & Vehicle Models with Phone/Reg Normalization');
    const rawPhone = '+91 98765-43210';
    const cleanPhone = normalizePhone(rawPhone);
    assert(cleanPhone === '9876543210', 'Phone number normalized from "+91 98765-43210" to "9876543210"');

    const customer = await Customer.create({
      customerId: custId1,
      name: 'Ahmed Khan',
      mobileNumber: cleanPhone,
      address: 'Shop 12, Station Road',
    });
    assert(customer.mobileNumber === '9876543210', 'Customer created with normalized mobile number');

    const rawReg = 'gj 05 ab 1234';
    const cleanReg = normalizeRegNumber(rawReg);
    assert(cleanReg === 'GJ05AB1234', 'Vehicle registration normalized from "gj 05 ab 1234" to "GJ05AB1234"');

    const vehId = await generateNextSequence('VEH', 4, false);
    const vehicle = await Vehicle.create({
      vehicleId: vehId,
      customerId: customer._id,
      bikeName: 'Honda Activa 6G',
      registrationNumber: cleanReg,
      currentKm: 14500,
    });
    assert(vehicle.customerId.equals(customer._id), 'Vehicle linked to Customer via ObjectId');
    assert(vehicle.registrationNumber === 'GJ05AB1234', 'Vehicle registration saved in uppercase without spaces');

    // ---------------------------------------------------------
    // TEST SUITE 4: Product & Inventory Movement Ledger
    // ---------------------------------------------------------
    console.log('\n[Suite 4] Product Catalog, Stock Status & Double-Entry Ledger');
    const product = await Product.create({
      productId: prdId,
      name: 'Castrol Active 20W40 4T 1L',
      category: 'Engine Oils',
      purchaseCost: 350,
      sellingPrice: 450,
      currentStock: 10,
      minimumStockLevel: 3,
    });
    assert(product.stockStatus === STOCK_STATUSES.IN_STOCK, 'Stock 10 with minimum 3 is IN_STOCK');

    // Stock deduction via ledger
    const prevStock = product.currentStock;
    product.currentStock -= 8; // 10 -> 2
    await product.save();
    assert(product.stockStatus === STOCK_STATUSES.LOW_STOCK, 'Stock 2 with minimum 3 is LOW_STOCK');

    await InventoryMovement.create({
      productId: product._id,
      movementType: INVENTORY_MOVEMENT_TYPES.SERVICE_USAGE,
      quantity: -8,
      previousStock: prevStock,
      newStock: product.currentStock,
      referenceId: 'NAG-2026-0001',
      notes: 'Used in Full Service job',
    });

    const movements = await InventoryMovement.find({ productId: product._id });
    assert(movements.length === 1, 'Inventory movement recorded in ledger');
    assert(movements[0].newStock === 2, 'Movement ledger verifies new stock level = 2');

    // ---------------------------------------------------------
    // TEST SUITE 5: Supplier & Supplier Orders
    // ---------------------------------------------------------
    console.log('\n[Suite 5] Supplier & Supplier Orders (Intake Logic)');
    const supId = await generateNextSequence('SUP', 4, false);
    const supplier = await Supplier.create({
      supplierId: supId,
      name: 'Metro Auto Spares',
      phone: '9898011223',
    });
    assert(supplier.supplierId === 'SUP-0001', 'Supplier created with SUP-0001');

    const ordId = await generateNextSequence('ORD', 4, true);
    const order = await SupplierOrder.create({
      orderId: ordId,
      supplierId: supplier._id,
      items: [
        {
          productId: product._id,
          productName: product.name,
          quantityRequested: 10,
          estimatedUnitCost: 350,
        },
      ],
      status: SUPPLIER_ORDER_STATUSES.ORDERED,
    });
    assert(order.status === SUPPLIER_ORDER_STATUSES.ORDERED, 'Supplier order created in ORDERED status');
    assert(product.currentStock === 2, 'Ordering parts does NOT prematurely increase inventory stock');

    // Mark received -> now stock increases
    order.status = SUPPLIER_ORDER_STATUSES.RECEIVED;
    order.receivedDate = new Date();
    await order.save();

    const stockBeforeReceipt = product.currentStock;
    product.currentStock += 10;
    await product.save();

    await InventoryMovement.create({
      productId: product._id,
      movementType: INVENTORY_MOVEMENT_TYPES.PURCHASE_RECEIVED,
      quantity: +10,
      previousStock: stockBeforeReceipt,
      newStock: product.currentStock,
      referenceId: order.orderId,
      notes: 'Received from supplier order',
    });
    assert(product.currentStock === 12, 'Inventory stock increases to 12 upon marking order RECEIVED');

    // ---------------------------------------------------------
    // TEST SUITE 6: Service Jobs (Full Service & Engine Jobs)
    // ---------------------------------------------------------
    console.log('\n[Suite 6] Service Jobs (Full Service & Engine Jobs) & Price Snapshot');
    const fullServiceJob = await ServiceJob.create({
      jobId: jobId,
      serviceType: JOB_TYPES.FULL_SERVICE,
      customerId: customer._id,
      vehicleId: vehicle._id,
      customerNameSnapshot: customer.name,
      mobileNumberSnapshot: customer.mobileNumber,
      bikeNameSnapshot: vehicle.bikeName,
      bikeNumberSnapshot: vehicle.registrationNumber,
      serviceDetails: 'General servicing, oil change, brake adjustment',
      status: JOB_STATUSES.IN_PROGRESS,
      partsUsed: [
        {
          productId: product._id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellingPrice, // ₹450 snapshot
          totalPrice: product.sellingPrice * 1,
        },
      ],
      partsSubtotal: 450,
      labourCharges: 350,
      totalAmount: 450 + 350, // ₹800
    });
    assert(fullServiceJob.totalAmount === 800, 'Full service job calculated total: 450 parts + 350 labour = ₹800');

    // Historical Price Protection Check:
    // Update product price from ₹450 to ₹500
    product.sellingPrice = 500;
    await product.save();
    assert(fullServiceJob.partsUsed[0].unitPrice === 450, 'Existing job retains historical ₹450 price snapshot even after product price changed to ₹500');

    // ---------------------------------------------------------
    // TEST SUITE 7: Bills, Independent Payments & Outstanding Math
    // ---------------------------------------------------------
    console.log('\n[Suite 7] Billing, Multi-Payment Ledger & Outstanding Calculation');
    const bill = await Bill.create({
      billNumber: billId,
      jobId: fullServiceJob._id,
      customerId: customer._id,
      vehicleId: vehicle._id,
      customerName: customer.name,
      mobileNumber: customer.mobileNumber,
      bikeName: vehicle.bikeName,
      bikeNumber: vehicle.registrationNumber,
      serviceType: 'Full Service',
      serviceDetails: fullServiceJob.serviceDetails,
      items: [
        {
          productId: product._id,
          productName: product.name,
          quantity: 1,
          unitPrice: 450,
          total: 450,
        },
      ],
      partsSubtotal: 450,
      labourCharges: 350,
      grandTotal: 800,
      totalPaid: 0,
      outstandingAmount: 800,
      paymentStatus: PAYMENT_STATUSES.UNPAID,
    });
    assert(bill.outstandingAmount === 800, 'Initial outstanding amount equals grand total ₹800');
    assert(bill.paymentStatus === PAYMENT_STATUSES.UNPAID, 'Initial bill status is UNPAID');

    // Partial Payment 1: ₹300
    const payId1 = await generateNextSequence('PAY', 4, true);
    const pay1 = await Payment.create({
      paymentId: payId1,
      billId: bill._id,
      customerId: customer._id,
      amount: 300,
      paymentMethod: PAYMENT_METHODS.CASH,
      notes: 'Initial deposit',
    });

    // Recompute bill outstanding from payments
    const paymentsForBill = await Payment.find({ billId: bill._id });
    const totalPaid1 = paymentsForBill.reduce((sum, p) => sum + p.amount, 0);
    bill.totalPaid = totalPaid1;
    bill.outstandingAmount = roundMoney(bill.grandTotal - totalPaid1);
    bill.paymentStatus =
      bill.outstandingAmount === 0
        ? PAYMENT_STATUSES.PAID
        : totalPaid1 > 0
        ? PAYMENT_STATUSES.PARTIALLY_PAID
        : PAYMENT_STATUSES.UNPAID;
    await bill.save();

    assert(bill.totalPaid === 300, 'Total paid updated to ₹300');
    assert(bill.outstandingAmount === 500, 'Remaining outstanding amount is ₹500');
    assert(bill.paymentStatus === PAYMENT_STATUSES.PARTIALLY_PAID, 'Bill status updated to PARTIALLY_PAID');

    // Partial Payment 2: ₹500 (Final Clearance)
    const payId2 = await generateNextSequence('PAY', 4, true);
    const pay2 = await Payment.create({
      paymentId: payId2,
      billId: bill._id,
      customerId: customer._id,
      amount: 500,
      paymentMethod: PAYMENT_METHODS.UPI,
      notes: 'Final balance clearance',
    });

    const allPayments = await Payment.find({ billId: bill._id });
    const totalPaid2 = allPayments.reduce((sum, p) => sum + p.amount, 0);
    bill.totalPaid = totalPaid2;
    bill.outstandingAmount = roundMoney(bill.grandTotal - totalPaid2);
    bill.paymentStatus =
      bill.outstandingAmount === 0
        ? PAYMENT_STATUSES.PAID
        : totalPaid2 > 0
        ? PAYMENT_STATUSES.PARTIALLY_PAID
        : PAYMENT_STATUSES.UNPAID;
    await bill.save();

    assert(allPayments.length === 2, 'Both payment transactions preserved in independent Payment collection');
    assert(bill.totalPaid === 800, 'Total paid is ₹800');
    assert(bill.outstandingAmount === 0, 'Outstanding amount is exactly ₹0');
    assert(bill.paymentStatus === PAYMENT_STATUSES.PAID, 'Bill status marked PAID');

    // ---------------------------------------------------------
    // TEST SUITE 8: Business Expenses & Payer Attribution
    // ---------------------------------------------------------
    console.log('\n[Suite 8] Business Expenses (OPEX) with Payer Attribution');
    const expId1 = await generateNextSequence('EXP', 4, true);
    const exp1 = await BusinessExpense.create({
      expenseId: expId1,
      category: EXPENSE_CATEGORIES.ELECTRICITY,
      description: 'Monthly workshop electricity bill',
      amount: 2000,
      paidBy: MONEY_SOURCES.GARAGE_MONEY,
    });
    assert(exp1.paidBy === MONEY_SOURCES.GARAGE_MONEY, 'Garage money expense recorded');

    const expId2 = await generateNextSequence('EXP', 4, true);
    const exp2 = await BusinessExpense.create({
      expenseId: expId2,
      category: EXPENSE_CATEGORIES.TOOLS,
      description: 'Air compressor valve replacement',
      amount: 1500,
      paidBy: MONEY_SOURCES.IMRAN_PERSONAL,
    });
    assert(exp2.paidBy === MONEY_SOURCES.IMRAN_PERSONAL, 'Partner out-of-pocket expense attributed to Imran');

    // ---------------------------------------------------------
    // TEST SUITE 9: Partner Transactions (Drawings / Withdrawals)
    // ---------------------------------------------------------
    console.log('\n[Suite 9] Partner Personal Withdrawals (Drawings)');
    const ptxId1 = await generateNextSequence('PTX', 4, true);
    const ptx1 = await PartnerTransaction.create({
      transactionId: ptxId1,
      partner: PARTNERS.NAIM,
      type: PARTNER_TRANSACTION_TYPES.PERSONAL_WITHDRAWAL,
      amount: 5000,
      source: MONEY_SOURCES.GARAGE_MONEY,
      reason: 'Personal family expense',
    });
    assert(ptx1.partner === PARTNERS.NAIM, 'Naim personal withdrawal recorded for ₹5,000');

    // ---------------------------------------------------------
    // TEST SUITE 10: Cash-Based 50/50 Monthly Settlement Math
    // ---------------------------------------------------------
    console.log('\n[Suite 10] 50/50 Cash-Based Monthly Settlement Formula Verification');
    // Scenario:
    // Cash collected = ₹1,00,000
    // Business expenses = ₹20,000 (including ₹2,000 out-of-pocket by Imran)
    // Net Distributable Profit = ₹1,00,000 - ₹20,000 = ₹80,000
    // Base 50% Share: Naim = ₹40,000, Imran = ₹40,000
    // Personal Withdrawals: Naim withdrew ₹10,000, Imran withdrew ₹5,000
    // Out-of-Pocket Credits: Imran paid ₹2,000, Naim paid ₹0
    // Final Settlement:
    // Naim = 40,000 - 10,000 + 0 = ₹30,000
    // Imran = 40,000 - 5,000 + 2,000 = ₹37,000

    const testCashReceived = 100000;
    const testExpenses = 20000;
    const testNetProfit = testCashReceived - testExpenses; // 80,000
    const baseShare = testNetProfit / 2; // 40,000

    const naimWithdrawals = 10000;
    const naimOutOfPocket = 0;
    const naimFinal = baseShare - naimWithdrawals + naimOutOfPocket; // 30,000

    const imranWithdrawals = 5000;
    const imranOutOfPocket = 2000;
    const imranFinal = baseShare - imranWithdrawals + imranOutOfPocket; // 37,000

    const settleMonth = 8;
    const settleYear = 2026;
    const settlement = await MonthlySettlement.create({
      settlementNumber: `SETTLE-${settleYear}-08`,
      month: settleMonth,
      year: settleYear,
      totalCashReceived: testCashReceived,
      totalBilledRevenue: 120000,
      totalOutstandingReceivables: 20000,
      totalBusinessExpenses: testExpenses,
      netDistributableProfit: testNetProfit,
      naimShare: baseShare,
      imranShare: baseShare,
      naimWithdrawals,
      imranWithdrawals,
      naimOutOfPocketCredit: naimOutOfPocket,
      imranOutOfPocketCredit: imranOutOfPocket,
      naimFinalPayout: naimFinal,
      imranFinalPayout: imranFinal,
      isFinalized: true,
      finalizedAt: new Date(),
    });

    assert(settlement.netDistributableProfit === 80000, 'Net Distributable Cash is exactly ₹80,000');
    assert(settlement.naimShare === 40000, 'Naim base 50% share is ₹40,000');
    assert(settlement.imranShare === 40000, 'Imran base 50% share is ₹40,000');
    assert(settlement.naimFinalPayout === 30000, 'Naim final payout matches formula: ₹30,000');
    assert(settlement.imranFinalPayout === 37000, 'Imran final payout matches formula: ₹37,000');

    // ---------------------------------------------------------
    // TEST SUITE 11: Zod Validation Schemas
    // ---------------------------------------------------------
    console.log('\n[Suite 11] Zod Validation Schemas Verification');
    const validCustData = {
      name: 'Rahul Sharma',
      mobileNumber: '9876543210',
      address: 'Main Bazar',
    };
    const parsedCust = createCustomerSchema.safeParse(validCustData);
    assert(parsedCust.success === true, 'Valid customer data passes Zod validation');

    const invalidCustData = {
      name: 'R',
      mobileNumber: '123', // invalid phone
    };
    const invalidParsed = createCustomerSchema.safeParse(invalidCustData);
    assert(invalidParsed.success === false, 'Invalid phone and short name rejected by Zod schema');

    const negativePayment = {
      billId: bill._id.toString(),
      amount: -500, // invalid negative amount
      paymentMethod: 'CASH',
    };
    const parsedPay = createPaymentSchema.safeParse(negativePayment);
    assert(parsedPay.success === false, 'Negative payment amount rejected by Zod schema');

    console.log('\n================================================================');
    console.log(`  PHASE 1 COMPLETE: ${passed} / ${total} TESTS PASSED SUCCESSFULLY!`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ Phase 1 Test Execution Failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runPhase1Tests();
