import { OutstandingService } from '../services/outstanding.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class OutstandingController {
  static async list(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await OutstandingService.getOutstandingRecords({
        search,
        page: Number(page || 1),
        limit: Number(limit || 20),
      });
      return ApiResponse.success(res, 'Customer dues list retrieved successfully', result.records, 200, {
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const record = await OutstandingService.createOutstandingRecord(req.body, req.user);
      return ApiResponse.success(res, 'Customer dues record created successfully', record, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const record = await OutstandingService.updateOutstandingRecord(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Customer dues record updated successfully', record);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      await OutstandingService.deleteOutstandingRecord(req.params.id, req.user);
      return ApiResponse.success(res, 'Customer dues record deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
