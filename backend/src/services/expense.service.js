import { Expense } from '../models/Expense.js';
import { Partner } from '../models/Partner.js';
import { PartnerService } from './partner.service.js';
import { PARTNERS, PARTNER_TRANSACTION_TYPES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { getNextSequence } from '../utils/sequenceGenerator.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class ExpenseService {
  static async createExpense(expenseData, user) {
    const amount = roundMoney(expenseData.amount);
    if (amount <= 0) throw ApiError.badRequest('Expense amount must be positive');

    const expenseNumber = await getNextSequence('EXP', 4, true);

    let partnerId = expenseData.partnerId || null;
    if (expenseData.paidBy && expenseData.paidBy !== 'GARAGE_ACCOUNT') {
      const partner = await Partner.findOne({
        $or: [
          { _id: expenseData.partnerId },
          { code: expenseData.paidBy },
          { name: { $regex: new RegExp(expenseData.paidBy, 'i') } },
        ],
      });
      if (partner) {
        partnerId = partner._id;
      }
    }

    const expense = await Expense.create({
      ...expenseData,
      expenseNumber,
      amount,
      partnerId,
      date: expenseData.date ? new Date(expenseData.date) : new Date(),
      createdBy: user?._id || 'ADMIN',
    });

    // If paid by a partner out of pocket, automatically log a PartnerTransaction
    if (expenseData.paidBy && expenseData.paidBy !== 'GARAGE_ACCOUNT') {
      const partnerKey = expenseData.paidBy.toUpperCase().includes('IMRAN') ? PARTNERS.IMRAN : PARTNERS.NAIM;
      await PartnerService.recordPartnerTransaction({
        partner: partnerKey,
        type: PARTNER_TRANSACTION_TYPES.OUT_OF_POCKET_EXPENSE,
        amount,
        reason: `Paid workshop expense (${expense.category}): ${expense.description}`,
        date: expense.date,
        notes: `Expense Voucher: ${expense.expenseNumber}`,
      }, user);
    }

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: expense._id,
      summary: `Created expense ${expense.expenseNumber} (₹${amount}, ${expense.category}) paid by ${expense.paidBy}`,
    });

    return expense;
  }

  static async getExpenses({
    category = '',
    paidBy = '',
    startDate = '',
    endDate = '',
    page = 1,
    limit = 20,
  }) {
    const query = {};
    if (category) query.category = category;
    if (paidBy) query.paidBy = paidBy;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [expenses, totalRecords] = await Promise.all([
      Expense.find(query)
        .populate('partnerId')
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    const totalAmountAgg = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalAmount = roundMoney(totalAmountAgg[0]?.total || 0);

    // Compute 3 main account totals across all records
    const accountTotalsAgg = await Expense.aggregate([
      {
        $group: {
          _id: '$paidBy',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let garageTotal = 0;
    let imranTotal = 0;
    let naimTotal = 0;

    accountTotalsAgg.forEach((item) => {
      const key = String(item._id || '').toUpperCase();
      const val = roundMoney(item.total || 0);
      if (key.includes('IMRAN') || key === 'PARTNER_A') {
        imranTotal += val;
      } else if (key.includes('NAIM') || key === 'PARTNER_B') {
        naimTotal += val;
      } else {
        garageTotal += val;
      }
    });

    return {
      expenses,
      totalAmount,
      accountTotals: {
        garage: roundMoney(garageTotal),
        imran: roundMoney(imranTotal),
        naim: roundMoney(naimTotal),
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getExpenseById(id) {
    const expense = await Expense.findById(id)
      .populate('partnerId')
      .populate('createdBy', 'name role')
      .lean();
    if (!expense) throw ApiError.notFound('Expense not found');
    return expense;
  }
}
