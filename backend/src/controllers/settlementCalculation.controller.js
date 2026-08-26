import { SettlementCalculationService } from '../services/settlementCalculation.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class SettlementCalculationController {
  static async save(req, res, next) {
    try {
      const record = await SettlementCalculationService.saveCalculation(req.body, req.user);
      return ApiResponse.created(res, 'Settlement calculation saved to history', record);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { records, pagination } = await SettlementCalculationService.getCalculations({ page, limit });
      return ApiResponse.success(res, 'Calculation history retrieved successfully', records, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await SettlementCalculationService.deleteCalculation(req.params.id, req.user);
      return ApiResponse.success(res, 'Calculation record deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }

  static async bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await SettlementCalculationService.bulkDeleteCalculations(ids, req.user);
      return ApiResponse.success(res, `${result.deletedCount} calculation records deleted permanently`, result);
    } catch (err) {
      next(err);
    }
  }
}
