import { DashboardService } from '../services/dashboard.service.js';
import { ReportService } from '../services/report.service.js';
import { SettingsService } from '../services/settings.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class DashboardController {
  static async getMetrics(req, res, next) {
    try {
      const data = await DashboardService.getDashboardMetrics();
      return ApiResponse.success(res, 'Dashboard metrics retrieved', data);
    } catch (err) {
      next(err);
    }
  }
}

export class ReportController {
  static async getFinancial(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportService.getFinancialReport({ startDate, endDate });
      return ApiResponse.success(res, 'Financial report generated', data);
    } catch (err) {
      next(err);
    }
  }

  static async getService(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportService.getServiceReport({ startDate, endDate });
      return ApiResponse.success(res, 'Service report generated', data);
    } catch (err) {
      next(err);
    }
  }

  static async getInventory(req, res, next) {
    try {
      const data = await ReportService.getInventoryReport();
      return ApiResponse.success(res, 'Inventory report generated', data);
    } catch (err) {
      next(err);
    }
  }
}

export class SettingsController {
  static async getSettings(req, res, next) {
    try {
      const data = await SettingsService.getSettings();
      return ApiResponse.success(res, 'Settings retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return ApiResponse.success(res, 'Settings updated successfully', settings);
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const { entityType, action, page, limit } = req.query;
      const { logs, pagination } = await SettingsService.getAuditLogs({ entityType, action, page, limit });
      return ApiResponse.success(res, 'Audit logs retrieved', logs, 200, pagination);
    } catch (err) {
      next(err);
    }
  }
}
