import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Expense } from '../models/Expense.js';
import { PartnerTransaction } from '../models/PartnerTransaction.js';
import { ExpenseService } from '../services/expense.service.js';
import { PARTNERS, PARTNER_TRANSACTION_TYPES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase13Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 13 OPERATING EXPENSES TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    await Expense.deleteMany({});
    await PartnerTransaction.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', role: 'ADMIN', name: 'Admin User' };

    // -------------------------------------------------------------
    // TEST SUITE 1: OPEX Voucher Creation & Sequence Generation
    // -------------------------------------------------------------
    console.log('[Suite 1] OPEX Voucher Creation & Sequence Generation');

    const exp1 = await ExpenseService.createExpense({
      category: 'ELECTRICITY',
      amount: 2500,
      description: 'Monthly workshop electricity bill',
      paidBy: 'GARAGE_ACCOUNT',
      paymentMethod: 'UPI',
      date: new Date(),
    }, mockAdmin);

    assert(exp1.expenseNumber && exp1.expenseNumber.startsWith('EXP-'), `Expense voucher generated: ${exp1.expenseNumber}`);
    assert(exp1.amount === 2500, 'Expense amount recorded: ₹2,500');
    assert(exp1.paidBy === 'GARAGE_ACCOUNT', 'Payer recorded as GARAGE_ACCOUNT');

    // Verify NO PartnerTransaction was created for garage account expense
    const pTxnCount1 = await PartnerTransaction.countDocuments({});
    assert(pTxnCount1 === 0, 'No PartnerTransaction created for garage account expense');

    // -------------------------------------------------------------
    // TEST SUITE 2: Partner Out-of-Pocket Expense Auto-Credit
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Partner Out-of-Pocket Expense Auto-Credit');

    const exp2 = await ExpenseService.createExpense({
      category: 'TOOLS',
      amount: 1500,
      description: 'Impact wrench socket set purchased from personal funds',
      paidBy: PARTNERS.NAIM,
      paymentMethod: 'CASH',
      date: new Date(),
    }, mockAdmin);

    assert(exp2.paidBy === PARTNERS.NAIM, 'Payer recorded as NAIM');

    // Verify automatic PartnerTransaction created
    const pTxns = await PartnerTransaction.find({ partner: PARTNERS.NAIM });
    assert(pTxns.length === 1, 'PartnerTransaction automatically created for Naim out-of-pocket expense');
    assert(pTxns[0].amount === 1500, 'PartnerTransaction amount matches expense: ₹1,500');
    assert(pTxns[0].type === PARTNER_TRANSACTION_TYPES.OUT_OF_POCKET_EXPENSE, 'Transaction type is OUT_OF_POCKET_EXPENSE');

    // -------------------------------------------------------------
    // TEST SUITE 3: Validation & Filtering
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Validation & Filtering');

    let rejectedZero = false;
    try {
      await ExpenseService.createExpense({
        category: 'OTHER',
        amount: 0,
        description: 'Zero test',
      }, mockAdmin);
    } catch (err) {
      rejectedZero = true;
      assert(err.message.includes('positive'), 'Zero amount rejected');
    }
    assert(rejectedZero, 'Zero expense attempt blocked');

    // Filter list
    const filteredList = await ExpenseService.getExpenses({ category: 'ELECTRICITY' });
    assert(filteredList.expenses.length === 1, 'Category filter returns 1 item');
    assert(filteredList.totalAmount === 2500, 'Total period amount calculated: ₹2,500');

    console.log(`\n================================================================`);
    console.log(`  PHASE 13 COMPLETE: ALL OPERATING EXPENSES TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase13Tests().catch((err) => {
  console.error('Phase 13 Test Suite Failed:', err);
  process.exit(1);
});
