import { WebsiteConfigService } from '../services/websiteConfig.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class WebsiteConfigController {
  // Public endpoint - Unauthenticated
  static async getPublicConfig(req, res, next) {
    try {
      const config = await WebsiteConfigService.getConfig();
      return ApiResponse.success(res, 'Public website configuration retrieved successfully', config);
    } catch (err) {
      next(err);
    }
  }

  // Admin endpoint - Authenticated & Authorized
  static async getAdminConfig(req, res, next) {
    try {
      const config = await WebsiteConfigService.getConfig();
      return ApiResponse.success(res, 'Website CMS configuration retrieved successfully', config);
    } catch (err) {
      next(err);
    }
  }

  // Admin endpoint - Update CMS settings
  static async updateAdminConfig(req, res, next) {
    try {
      const updated = await WebsiteConfigService.updateConfig(req.body);
      return ApiResponse.success(res, 'Website CMS configuration updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  // Admin endpoint - Reset to defaults
  static async resetAdminConfig(req, res, next) {
    try {
      const reset = await WebsiteConfigService.resetToDefaults();
      return ApiResponse.success(res, 'Website CMS configuration reset to default factory settings', reset);
    } catch (err) {
      next(err);
    }
  }
}
