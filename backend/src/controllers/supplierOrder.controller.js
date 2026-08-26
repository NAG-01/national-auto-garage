import { SupplierOrderService } from '../services/supplierOrder.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class SupplierOrderController {
  static async create(req, res, next) {
    try {
      const order = await SupplierOrderService.createOrder(req.body, req.user);
      return ApiResponse.created(res, 'Supplier order created successfully', order);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { status, supplierId, search, page, limit } = req.query;
      const { orders, summary, pagination } = await SupplierOrderService.getOrders({
        status,
        supplierId,
        search,
        page,
        limit,
      });
      return ApiResponse.success(res, 'Supplier orders retrieved successfully', { orders, summary }, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const order = await SupplierOrderService.getOrderById(req.params.id);
      return ApiResponse.success(res, 'Supplier order details retrieved', order);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const order = await SupplierOrderService.updateOrder(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Supplier order updated successfully', order);
    } catch (err) {
      next(err);
    }
  }

  static async markAsOrdered(req, res, next) {
    try {
      const order = await SupplierOrderService.markAsOrdered(req.params.id, req.user);
      return ApiResponse.success(res, 'Supplier order marked as ORDERED', order);
    } catch (err) {
      next(err);
    }
  }

  static async markAsReceived(req, res, next) {
    try {
      const order = await SupplierOrderService.markAsReceived(req.params.id, req.user);
      return ApiResponse.success(res, 'Supplier order marked as RECEIVED and inventory stock updated', order);
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { reason } = req.body;
      const order = await SupplierOrderService.cancelOrder(req.params.id, reason, req.user);
      return ApiResponse.success(res, 'Supplier order cancelled', order);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await SupplierOrderService.deleteOrder(req.params.id, req.user);
      return ApiResponse.success(res, 'Supplier order deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
