import { CustomerService } from '../services/customer.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CustomerController {
  static async create(req, res, next) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user);
      return ApiResponse.created(res, 'Customer created successfully', customer);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await CustomerService.getCustomers({
        search,
        status,
        page: Number(page || 1),
        limit: Number(limit || 20),
      });
      return ApiResponse.success(res, 'Customers list retrieved', result.customers, 200, {
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await CustomerService.getCustomerById(req.params.id);
      return ApiResponse.success(res, 'Customer profile retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Customer updated successfully', customer);
    } catch (err) {
      next(err);
    }
  }

  static async archive(req, res, next) {
    try {
      const customer = await CustomerService.archiveCustomer(req.params.id, req.user);
      return ApiResponse.success(res, 'Customer archived successfully', customer);
    } catch (err) {
      next(err);
    }
  }

  static async restore(req, res, next) {
    try {
      const customer = await CustomerService.restoreCustomer(req.params.id, req.user);
      return ApiResponse.success(res, 'Customer restored successfully', customer);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await CustomerService.deleteCustomer(req.params.id, req.user);
      return ApiResponse.success(res, 'Customer deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
