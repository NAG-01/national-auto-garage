import { SupplierService } from '../services/supplier.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class SupplierController {
  static async create(req, res, next) {
    try {
      const supplier = await SupplierService.createSupplier(req.body, req.user);
      return ApiResponse.created(res, 'Supplier created successfully', supplier);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const { suppliers, summary, pagination } = await SupplierService.getSuppliers({ search, status, page, limit });
      return ApiResponse.success(res, 'Suppliers retrieved successfully', { suppliers, summary }, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await SupplierService.getSupplierById(req.params.id);
      return ApiResponse.success(res, 'Supplier details retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const supplier = await SupplierService.updateSupplier(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Supplier updated successfully', supplier);
    } catch (err) {
      next(err);
    }
  }

  static async archive(req, res, next) {
    try {
      const result = await SupplierService.archiveSupplier(req.params.id, req.user);
      return ApiResponse.success(res, 'Supplier archived successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async restore(req, res, next) {
    try {
      const supplier = await SupplierService.restoreSupplier(req.params.id, req.user);
      return ApiResponse.success(res, 'Supplier restored successfully', supplier);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await SupplierService.deleteSupplier(req.params.id, req.user);
      return ApiResponse.success(res, 'Supplier deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
