import { BillService } from '../services/bill.service.js';
import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BillController {
  static async create(req, res, next) {
    try {
      const bill = await BillService.createBill(req.body, req.user);
      return ApiResponse.created(res, 'Bill generated successfully', bill);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { search, status, startDate, endDate, page, limit } = req.query;
      const result = await BillService.getBills({
        search,
        status,
        startDate,
        endDate,
        page: Number(page || 1),
        limit: Number(limit || 20),
      });
      return ApiResponse.success(res, 'Bills list retrieved successfully', result.bills, 200, {
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const bill = await BillService.getBillById(req.params.id);
      return ApiResponse.success(res, 'Bill details retrieved successfully', bill);
    } catch (err) {
      next(err);
    }
  }

  static async recordPayment(req, res, next) {
    try {
      const result = await PaymentService.recordPayment({
        billId: req.params.id,
        amount: req.body.amount,
        paymentMethod: req.body.paymentMethod,
        paymentDate: req.body.paymentDate,
        notes: req.body.notes,
        user: req.user,
      });
      return ApiResponse.created(res, 'Payment recorded successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await BillService.deleteBill(req.params.id, req.user);
      return ApiResponse.success(res, 'Bill deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
