import { Settings } from '../models/Settings.js';
import { ServiceType } from '../models/ServiceType.js';
import { Employee } from '../models/Employee.js';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

export class SettingsService {
  static async getSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        garageName: 'National Auto Garage',
        tagline: 'Two-Wheeler Service & Repair Specialists',
        phone: '+91 98765 43210',
        email: 'contact@nationalautogarage.com',
        address: 'Shop No. 4, Garage Hub, Main Road, City',
        gstNumber: '',
        currencySymbol: '₹',
        dateFormat: 'DD/MM/YYYY',
        invoicePrefix: 'INV',
        jobIdPrefix: 'NAG',
        portalBadgeText: 'ADMIN PORTAL',
        topbarContextText: 'Workshop System',
        brandNameMain: 'National Auto',
        brandNameSub: 'Garage Portal',
        invoiceFooterNote: 'Thank you for choosing National Auto Garage! Safe Riding.',
      });
    } else {
      // Backwards compatibility for existing document
      let updated = false;
      if (!settings.portalBadgeText) { settings.portalBadgeText = 'ADMIN PORTAL'; updated = true; }
      if (!settings.topbarContextText) { settings.topbarContextText = 'Workshop System'; updated = true; }
      if (!settings.brandNameMain) { settings.brandNameMain = 'National Auto'; updated = true; }
      if (!settings.brandNameSub) { settings.brandNameSub = 'Garage Portal'; updated = true; }
      if (!settings.invoiceFooterNote) { settings.invoiceFooterNote = 'Thank you for choosing National Auto Garage! Safe Riding.'; updated = true; }
      if (updated) await settings.save();
    }
    return settings;
  }

  static async updateSettings(data) {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(data);
    } else {
      Object.assign(settings, data);
    }
    await settings.save();
    return settings;
  }

  static async getSystemMetadata() {
    const settings = await this.getSettings();
    const serviceTypes = await ServiceType.find({ isActive: true }).sort({ category: 1, name: 1 });
    const employees = await Employee.find({ isActive: true }).sort({ name: 1 });

    return {
      settings,
      serviceTypes,
      employees,
      expenseCategories: EXPENSE_CATEGORIES,
    };
  }

  static async getAuditLogs() {
    return {
      logs: [],
      pagination: { page: 1, limit: 50, totalRecords: 0, totalPages: 0 },
    };
  }
}
