import { Settings } from '../models/Settings.js';
import { AuditLog } from '../models/AuditLog.js';
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
        inventoryCategories: ['Engine Parts', 'Brake Systems', 'Electrical & Lighting', 'Filters & Plugs', 'Oils & Lubricants', 'Tyres & Tubes', 'Chains & Sprockets', 'Accessories'],
        expenseCategories: EXPENSE_CATEGORIES,
        paymentMethods: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'],
      });
    }

    const serviceTypes = await ServiceType.find();
    const employees = await Employee.find();

    return {
      settings,
      serviceTypes,
      employees,
    };
  }

  static async updateSettings(updateData) {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }
    return settings;
  }

  static async getAuditLogs({ entityType = '', action = '', page = 1, limit = 50 }) {
    const query = {};
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;

    const skip = (page - 1) * limit;
    const [logs, totalRecords] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }
}
