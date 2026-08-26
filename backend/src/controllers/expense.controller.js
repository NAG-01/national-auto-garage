import { ExpenseService } from '../services/expense.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ExpenseController {
  static async create(req, res, next) {
    try {
      const expense = await ExpenseService.createExpense(req.body, req.user);
      return ApiResponse.created(res, 'Expense recorded successfully', expense);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { category, paidBy, startDate, endDate, page, limit } = req.query;
      const { expenses, totalAmount, accountTotals, pagination } = await ExpenseService.getExpenses({
        category,
        paidBy,
        startDate,
        endDate,
        page,
        limit,
      });
      return ApiResponse.success(res, 'Expenses retrieved successfully', { expenses, totalAmount, accountTotals }, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const expense = await ExpenseService.getExpenseById(req.params.id);
      return ApiResponse.success(res, 'Expense retrieved successfully', expense);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const expense = await ExpenseService.updateExpense(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Expense updated successfully', expense);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await ExpenseService.deleteExpense(req.params.id, req.user);
      return ApiResponse.success(res, 'Expense deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }
}
