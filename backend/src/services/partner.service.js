import mongoose from 'mongoose';
import { PartnerTransaction } from '../models/PartnerTransaction.js';
import { MonthlySettlement } from '../models/MonthlySettlement.js';
import { Payment } from '../models/Payment.js';
import { Bill } from '../models/Bill.js';
import { Expense } from '../models/Expense.js';
import { Counter } from '../models/Counter.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { PARTNERS, PARTNER_TRANSACTION_TYPES } from '../config/constants.js';

export class PartnerService {
  static async getNextTransactionId() {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'partnerTransaction' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqStr = String(counter.seq).padStart(4, '0');
    return `PTXN-${seqStr}`;
  }

  static async calculateMonthlySettlement(month, year) {
    const numMonth = Number(month);
    const numYear = Number(year);

    const startDate = new Date(numYear, numMonth - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(numYear, numMonth, 0, 23, 59, 59, 999);

    // Check if settlement is already finalized in MongoDB
    const existingFinalized = await MonthlySettlement.findOne({
      month: numMonth,
      year: numYear,
      isFinalized: true,
    }).lean();

    if (existingFinalized) {
      const totalRevenue = existingFinalized.totalRevenue || existingFinalized.totalCashReceived || existingFinalized.totalBilledRevenue || 0;
      const netProfit = existingFinalized.netProfit || existingFinalized.netDistributableProfit || 0;
      const partnerShares = existingFinalized.partnerShares || [
        { partnerName: 'Naim Pathan', ownershipPercentage: 50, baseProfitShare: roundMoney(netProfit * 0.5) },
        { partnerName: 'Imran Pathan', ownershipPercentage: 50, baseProfitShare: roundMoney(netProfit * 0.5) },
      ];
      return {
        ...existingFinalized,
        totalRevenue,
        netProfit,
        partnerShares,
      };
    }

    const allPayments = await Payment.find({}).lean();
    const allBills = await Bill.find({}).lean();

    // 1. Total Cash Collections from Payments in month
    const cashAgg = await Payment.aggregate([
      { $match: { paymentDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalCashReceived = roundMoney(cashAgg[0]?.total || 0);

    // 2. Total Billed Revenue from Bills issued in month
    const billAgg = await Bill.aggregate([
      { $match: { billDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$grandTotal' },
          totalOutstanding: { $sum: '$outstandingAmount' },
        },
      },
    ]);
    const totalBilledRevenue = roundMoney(billAgg[0]?.totalBilled || 0);
    const totalOutstandingReceivables = roundMoney(billAgg[0]?.totalOutstanding || 0);

    // 3. Total Garage Business Expenses in month
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          paidBy: { $in: ['GARAGE_ACCOUNT', 'GARAGE', null, ''] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalBusinessExpenses = roundMoney(expenseAgg[0]?.total || 0);

    // 4. Net Distributable Profit
    const netDistributableProfit = roundMoney(totalCashReceived - totalBusinessExpenses);
    const naimShare = roundMoney(netDistributableProfit * 0.5);
    const imranShare = roundMoney(netDistributableProfit * 0.5);

    // 5. Aggregate Partner Transactions in month
    const txns = await PartnerTransaction.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    let naimWithdrawals = 0;
    let imranWithdrawals = 0;
    let naimOutOfPocketCredit = 0;
    let imranOutOfPocketCredit = 0;

    for (const t of txns) {
      if (t.partner === PARTNERS.NAIM) {
        if (t.type === PARTNER_TRANSACTION_TYPES.PERSONAL_WITHDRAWAL) {
          naimWithdrawals += t.amount;
        } else if (t.type === PARTNER_TRANSACTION_TYPES.OUT_OF_POCKET_EXPENSE) {
          naimOutOfPocketCredit += t.amount;
        }
      } else if (t.partner === PARTNERS.IMRAN) {
        if (t.type === PARTNER_TRANSACTION_TYPES.PERSONAL_WITHDRAWAL) {
          imranWithdrawals += t.amount;
        } else if (t.type === PARTNER_TRANSACTION_TYPES.OUT_OF_POCKET_EXPENSE) {
          imranOutOfPocketCredit += t.amount;
        }
      }
    }

    // Also include any Expenses paid directly out of pocket by partners
    const naimExpenses = await Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate }, paidBy: PARTNERS.NAIM } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    naimOutOfPocketCredit += naimExpenses[0]?.total || 0;

    const imranExpenses = await Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate }, paidBy: PARTNERS.IMRAN } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    imranOutOfPocketCredit += imranExpenses[0]?.total || 0;

    naimWithdrawals = roundMoney(naimWithdrawals);
    imranWithdrawals = roundMoney(imranWithdrawals);
    naimOutOfPocketCredit = roundMoney(naimOutOfPocketCredit);
    imranOutOfPocketCredit = roundMoney(imranOutOfPocketCredit);

    const naimFinalPayout = roundMoney(naimShare - naimWithdrawals + naimOutOfPocketCredit);
    const imranFinalPayout = roundMoney(imranShare - imranWithdrawals + imranOutOfPocketCredit);

    const totalRevenue = totalCashReceived || totalBilledRevenue;
    const netProfit = netDistributableProfit;
    const partnerShares = [
      { partnerName: 'Naim Pathan', ownershipPercentage: 50, baseProfitShare: naimShare },
      { partnerName: 'Imran Pathan', ownershipPercentage: 50, baseProfitShare: imranShare },
    ];

    return {
      settlementNumber: `DRAFT-${numYear}-${String(numMonth).padStart(2, '0')}`,
      month: numMonth,
      year: numYear,
      totalRevenue,
      totalCashReceived,
      totalBilledRevenue,
      totalOutstandingReceivables,
      totalBusinessExpenses,
      netDistributableProfit,
      netProfit,
      partnerShares,
      naimShare,
      imranShare,
      naimWithdrawals,
      imranWithdrawals,
      naimOutOfPocketCredit,
      imranOutOfPocketCredit,
      naimFinalPayout,
      imranFinalPayout,
      isFinalized: false,
    };
  }

  static async recordPartnerTransaction(data, user) {
    const transactionId = await this.getNextTransactionId();

    const transaction = await PartnerTransaction.create({
      transactionId,
      partner: data.partner,
      type: data.type,
      amount: roundMoney(data.amount),
      source: data.source,
      reason: data.reason,
      date: data.date ? new Date(data.date) : new Date(),
      notes: data.notes || '',
    });

    return transaction;
  }

  static async getPartnerTransactions({ partner = '', type = '', month = '', year = '', page = 1, limit = 20 }) {
    const query = {};

    if (partner) query.partner = partner;
    if (type) query.type = type;

    if (month && year) {
      const numMonth = Number(month);
      const numYear = Number(year);
      const startDate = new Date(numYear, numMonth - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(numYear, numMonth, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (page - 1) * limit;
    const [transactions, totalRecords] = await Promise.all([
      PartnerTransaction.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      PartnerTransaction.countDocuments(query),
    ]);

    return {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async finalizeMonthlySettlement(month, year, notes = '', user) {
    const numMonth = Number(month);
    const numYear = Number(year);

    const existing = await MonthlySettlement.findOne({
      month: numMonth,
      year: numYear,
      isFinalized: true,
    });

    if (existing) {
      throw ApiError.badRequest(`Monthly settlement for ${numMonth}/${numYear} is already finalized.`);
    }

    const draft = await this.calculateMonthlySettlement(numMonth, numYear);

    const settlementNumber = `SETTLE-${numYear}-${String(numMonth).padStart(2, '0')}`;

    const settlement = await MonthlySettlement.create({
      settlementNumber,
      month: numMonth,
      year: numYear,
      totalCashReceived: draft.totalCashReceived,
      totalBilledRevenue: draft.totalBilledRevenue,
      totalOutstandingReceivables: draft.totalOutstandingReceivables,
      totalBusinessExpenses: draft.totalBusinessExpenses,
      netDistributableProfit: draft.netDistributableProfit,
      naimShare: draft.naimShare,
      imranShare: draft.imranShare,
      naimWithdrawals: draft.naimWithdrawals,
      imranWithdrawals: draft.imranWithdrawals,
      naimOutOfPocketCredit: draft.naimOutOfPocketCredit,
      imranOutOfPocketCredit: draft.imranOutOfPocketCredit,
      naimFinalPayout: draft.naimFinalPayout,
      imranFinalPayout: draft.imranFinalPayout,
      isFinalized: true,
      finalizedAt: new Date(),
      notes,
    });

    return settlement;
  }

  static async getSettlementHistory({ year = '', page = 1, limit = 20 }) {
    const query = { isFinalized: true };
    if (year) query.year = Number(year);

    const skip = (page - 1) * limit;
    const [settlements, totalRecords] = await Promise.all([
      MonthlySettlement.find(query).sort({ year: -1, month: -1 }).skip(skip).limit(limit).lean(),
      MonthlySettlement.countDocuments(query),
    ]);

    return {
      settlements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }
}
