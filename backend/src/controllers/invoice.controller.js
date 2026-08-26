import { InvoiceService } from '../services/invoice.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class InvoiceController {
  static async generate(req, res, next) {
    try {
      const { jobId } = req.body;
      const invoice = await InvoiceService.generateInvoiceFromJob(jobId, req.user);
      return ApiResponse.created(res, invoice, 'Invoice generated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { customerId, paymentStatus, startDate, endDate, search, page, limit } = req.query;
      const { invoices, pagination } = await InvoiceService.getInvoices({
        customerId,
        paymentStatus,
        startDate,
        endDate,
        search,
        page,
        limit,
      });
      return ApiResponse.success(res, invoices, 'Invoices retrieved successfully', 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await InvoiceService.getInvoiceById(req.params.id);
      return ApiResponse.success(res, result, 'Invoice details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await InvoiceService.deleteInvoice(req.params.id, req.user);
      return ApiResponse.success(res, null, 'Invoice deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
