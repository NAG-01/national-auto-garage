import { Expense } from '../models/Expense.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { getNextSequence } from '../utils/sequenceGenerator.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class ExpenseService {
  static async createExpense(expenseData, user) {
    const amount = roundMoney(expenseData.amount);
    if (amount <= 0) throw ApiError.badRequest('Expense amount must be positive');

    const expenseNumber = await getNextSequence('EXP', 4, true);

    const expense = await Expense.create({
      ...expenseData,
      expenseNumber,
      amount,
      paidBy: expenseData.paidBy || 'GARAGE_ACCOUNT',
      date: expenseData.date ? new Date(expenseData.date) : new Date(),
      createdBy: user?._id || 'ADMIN',
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: expense._id,
      summary: `Created expense ${expense.expenseNumber} (₹${amount}) paid by ${expense.paidBy}`,
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
      .populate('createdBy', 'name role')
      .lean();
    if (!expense) throw ApiError.notFound('Expense not found');
    return expense;
  }

  static async updateExpense(id, updateData, user) {
    const expense = await Expense.findById(id);
    if (!expense) throw ApiError.notFound('Expense entry not found');

    if (updateData.amount !== undefined) {
      const amount = roundMoney(updateData.amount);
      if (amount <= 0) throw ApiError.badRequest('Expense amount must be positive');
      expense.amount = amount;
    }

    if (updateData.description !== undefined) {
      expense.description = updateData.description.trim() || 'Expense Entry';
    }

    if (updateData.paidBy !== undefined) {
      expense.paidBy = updateData.paidBy;
    }

    if (updateData.date) {
      expense.date = new Date(updateData.date);
    }

    if (updateData.notes !== undefined) {
      expense.notes = updateData.notes;
    }

    await expense.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'UPDATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: expense._id,
      summary: `Updated expense ${expense.expenseNumber} (₹${expense.amount}) paid by ${expense.paidBy}`,
    });

    return expense;
  }

  static async deleteExpense(id, user) {
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) throw ApiError.notFound('Expense entry not found');

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'DELETE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: id,
      summary: `Deleted expense ${expense.expenseNumber} (₹${expense.amount}) paid by ${expense.paidBy}`,
    });

    return { success: true };
  }

  static async bulkDeleteExpenses(ids = [], user) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw ApiError.badRequest('No item IDs provided for bulk delete');
    }

    const result = await Expense.deleteMany({ _id: { $in: ids } });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'BULK_DELETE_EXPENSES',
      entityType: 'EXPENSE',
      summary: `Bulk deleted ${result.deletedCount} expense entries from database`,
    });

    return { deletedCount: result.deletedCount };
  }
}
