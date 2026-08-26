import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PaymentController {
  static async record(req, res, next) {
    try {
      const result = await PaymentService.recordPayment(req.body, req.user);
      return ApiResponse.created(res, result, 'Payment recorded successfully');
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { customerId, invoiceId, paymentMethod, startDate, endDate, page, limit } = req.query;
      const { payments, totalCollected, pagination } = await PaymentService.getPayments({
        customerId,
        invoiceId,
        paymentMethod,
        startDate,
        endDate,
        page,
        limit,
      });
      return ApiResponse.success(res, { payments, totalCollected }, 'Payments retrieved successfully', 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}
