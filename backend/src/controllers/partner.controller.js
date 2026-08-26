import { PartnerService } from '../services/partner.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PartnerController {
  static async getSummary(req, res, next) {
    try {
      const now = new Date();
      const month = Number(req.query.month || now.getMonth() + 1);
      const year = Number(req.query.year || now.getFullYear());

      const summary = await PartnerService.calculateMonthlySettlement(month, year);
      return ApiResponse.success(res, 'Monthly partnership settlement summary retrieved', summary);
    } catch (err) {
      next(err);
    }
  }

  static async recordTransaction(req, res, next) {
    try {
      const transaction = await PartnerService.recordPartnerTransaction(req.body, req.user);
      return ApiResponse.success(res, 'Partner transaction recorded successfully', transaction, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const result = await PartnerService.getPartnerTransactions(req.query);
      return ApiResponse.success(res, 'Partner transactions retrieved successfully', result.transactions, 200, {
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async finalizeSettlement(req, res, next) {
    try {
      const { month, year, notes } = req.body;
      const settlement = await PartnerService.finalizeMonthlySettlement(month, year, notes, req.user);
      return ApiResponse.success(res, 'Monthly settlement finalized successfully', settlement, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const result = await PartnerService.getSettlementHistory(req.query);
      return ApiResponse.success(res, 'Settlement history retrieved successfully', result.settlements, 200, {
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }
}
