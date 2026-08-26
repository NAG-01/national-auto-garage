import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { PartnerTransaction } from '../models/PartnerTransaction.js';
import { MonthlySettlement } from '../models/MonthlySettlement.js';
import { Payment } from '../models/Payment.js';
import { Bill } from '../models/Bill.js';
import { Expense } from '../models/Expense.js';
import { PartnerService } from '../services/partner.service.js';
import { PARTNERS, PARTNER_TRANSACTION_TYPES, MONEY_SOURCES } from '../config/constants.js';
import { roundMoney } from '../utils/currency.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase11Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 11 PARTNERSHIP MODULE TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await PartnerTransaction.deleteMany({});
    await MonthlySettlement.deleteMany({});
    await Payment.deleteMany({});
    await Bill.deleteMany({});
    await Expense.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN' };
    const month = 8;
    const year = 2026;
    const testDate = new Date(2026, 7, 15, 12, 0, 0);

    // 1. Create baseline mock data for August 2026
    // Bill: ₹10,000 grand total
    const mockCustomerId = new mongoose.Types.ObjectId();
    const mockBill = await Bill.create({
      billNumber: 'INV-2026-9901',
      customerId: mockCustomerId,
      vehicleId: new mongoose.Types.ObjectId(),
      customerName: 'Karan Mehta',
      mobileNumber: '9988776655',
      bikeName: 'KTM Duke 390',
      serviceType: 'FULL_SERVICE',
      grandTotal: 10000,
      totalPaid: 8000,
      outstandingAmount: 2000,
      billDate: testDate,
    });

    // Payment: ₹8,000 cash collection
    await Payment.create({
      paymentId: 'PAY-2026-9901',
      billId: mockBill._id,
      customerId: mockCustomerId,
      amount: 8000,
      paymentMethod: 'UPI',
      paymentDate: testDate,
    });

    // Expense: ₹2,000 workshop electricity expense paid from garage account
    await Expense.create({
      expenseNumber: 'EXP-2026-9901',
      category: 'ELECTRICITY',
      amount: 2000,
      date: testDate,
      description: 'August Electricity Bill',
      paidBy: 'GARAGE_ACCOUNT',
    });

    // -------------------------------------------------------------
    // TEST SUITE 1: 50/50 Profit Split Base Calculation
    // -------------------------------------------------------------
    console.log('[Suite 1] 50/50 Profit Split Base Calculation');
    const draft1 = await PartnerService.calculateMonthlySettlement(month, year);

    assert(draft1.totalCashReceived === 8000, 'Total cash received: ₹8,000');
    assert(draft1.totalBilledRevenue === 10000, 'Total billed revenue: ₹10,000');
    assert(draft1.totalOutstandingReceivables === 2000, 'Total outstanding receivables: ₹2,000');
    assert(draft1.totalBusinessExpenses === 2000, 'Total garage expenses: ₹2,000');
    assert(draft1.netDistributableProfit === 6000, 'Net Distributable Profit: 8000 - 2000 = ₹6,000');
    assert(draft1.naimShare === 3000, 'Naim 50% base share: ₹3,000');
    assert(draft1.imranShare === 3000, 'Imran 50% base share: ₹3,000');

    // -------------------------------------------------------------
    // TEST SUITE 2: Partner Personal Withdrawal Deduction
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Partner Personal Withdrawal Deduction');
    const txn1 = await PartnerService.recordPartnerTransaction({
      partner: PARTNERS.NAIM,
      type: PARTNER_TRANSACTION_TYPES.PERSONAL_WITHDRAWAL,
      amount: 1000,
      reason: 'Personal expense draw by Naim',
      date: testDate,
    }, mockAdmin);

    assert(txn1.transactionId.startsWith('PTXN-'), `Transaction ID generated atomically: ${txn1.transactionId}`);

    const draft2 = await PartnerService.calculateMonthlySettlement(month, year);
    assert(draft2.naimWithdrawals === 1000, 'Naim total withdrawals recorded: ₹1,000');
    assert(draft2.naimFinalPayout === 2000, 'Naim final payout updated: 3000 - 1000 = ₹2,000');

    // -------------------------------------------------------------
    // TEST SUITE 3: Partner Out-of-Pocket Credit
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Partner Out-of-Pocket Credit');
    await PartnerService.recordPartnerTransaction({
      partner: PARTNERS.IMRAN,
      type: PARTNER_TRANSACTION_TYPES.OUT_OF_POCKET_EXPENSE,
      amount: 500,
      reason: 'Imran bought workshop tools from personal cash',
      date: testDate,
    }, mockAdmin);

    const draft3 = await PartnerService.calculateMonthlySettlement(month, year);
    assert(draft3.imranOutOfPocketCredit === 500, 'Imran out-of-pocket credit recorded: ₹500');
    assert(draft3.imranFinalPayout === 3500, 'Imran final payout updated: 3000 + 500 = ₹3,500');

    // -------------------------------------------------------------
    // TEST SUITE 4: Monthly Settlement Finalization & Protection
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Monthly Settlement Finalization & Protection');
    const settlement = await PartnerService.finalizeMonthlySettlement(month, year, 'August 2026 Finalized', mockAdmin);

    assert(settlement.settlementNumber === 'SETTLE-2026-08', `Settlement number generated: ${settlement.settlementNumber}`);
    assert(settlement.isFinalized === true, 'Settlement status set to isFinalized = true');
    assert(settlement.naimFinalPayout === 2000, 'Finalized Naim payout frozen at ₹2,000');
    assert(settlement.imranFinalPayout === 3500, 'Finalized Imran payout frozen at ₹3,500');

    let duplicateErr = false;
    try {
      await PartnerService.finalizeMonthlySettlement(month, year, 'Duplicate attempt', mockAdmin);
    } catch (err) {
      duplicateErr = true;
      assert(err.message.includes('already finalized'), `Duplicate finalization rejected: "${err.message}"`);
    }
    assert(duplicateErr === true, 'Duplicate settlement finalization blocked');

    // -------------------------------------------------------------
    // TEST SUITE 5: Immutable Frozen Settlement Retrieval
    // -------------------------------------------------------------
    console.log('\n[Suite 5] Immutable Frozen Settlement Retrieval');
    const fetchedSettlement = await PartnerService.calculateMonthlySettlement(month, year);
    assert(fetchedSettlement.isFinalized === true, 'Frozen settlement returned upon recalculation');
    assert(fetchedSettlement.settlementNumber === 'SETTLE-2026-08', 'Returned settlement retains SETTLE-2026-08 ID');

    console.log(`\n================================================================`);
    console.log(`  PHASE 11 COMPLETE: ALL PARTNERSHIP MODULE TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase11Tests().catch((err) => {
  console.error('Phase 11 Test Suite Failed:', err);
  process.exit(1);
});
