import { SettlementCalculation } from '../models/SettlementCalculation.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { getNextSequence } from '../utils/sequenceGenerator.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class SettlementCalculationService {
  static async saveCalculation(data, user) {
    const totalRevenue = roundMoney(data.totalRevenue || 0);
    const garageExpenses = roundMoney(data.garageExpenses || 0);
    const naimAdvance = roundMoney(data.naimAdvance || 0);
    const imranAdvance = roundMoney(data.imranAdvance || 0);

    const netProfit = roundMoney(totalRevenue - garageExpenses);
    const naimBaseShare = roundMoney(netProfit * 0.5);
    const imranBaseShare = roundMoney(netProfit * 0.5);

    const naimFinalPayout = roundMoney(naimBaseShare - naimAdvance);
    const imranFinalPayout = roundMoney(imranBaseShare - imranAdvance);

    const calculationNumber = await getNextSequence('CALC', 4, true);

    const record = await SettlementCalculation.create({
      calculationNumber,
      date: data.date ? new Date(data.date) : new Date(),
      totalRevenue,
      garageExpenses,
      netProfit,
      naimAdvance,
      imranAdvance,
      naimBaseShare,
      imranBaseShare,
      naimFinalPayout,
      imranFinalPayout,
      notes: data.notes || '',
      createdBy: user?._id || null,
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_SETTLEMENT_CALCULATION',
      entityType: 'SETTLEMENT_CALCULATION',
      entityId: record._id,
      summary: `Saved settlement calculation ${record.calculationNumber} (Net Profit: ₹${netProfit}, Naim: ₹${naimFinalPayout}, Imran: ₹${imranFinalPayout})`,
    });

    return record;
  }

  static async getCalculations({ page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const [records, totalRecords] = await Promise.all([
      SettlementCalculation.find({})
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SettlementCalculation.countDocuments({}),
    ]);

    return {
      records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async deleteCalculation(id, user) {
    const record = await SettlementCalculation.findByIdAndDelete(id);
    if (!record) throw ApiError.notFound('Calculation record not found');

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'DELETE_SETTLEMENT_CALCULATION',
      entityType: 'SETTLEMENT_CALCULATION',
      entityId: id,
      summary: `Deleted settlement calculation ${record.calculationNumber}`,
    });

    return { success: true };
  }

  static async bulkDeleteCalculations(ids = [], user) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw ApiError.badRequest('No calculation IDs provided for bulk delete');
    }

    const result = await SettlementCalculation.deleteMany({ _id: { $in: ids } });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'BULK_DELETE_SETTLEMENT_CALCULATIONS',
      entityType: 'SETTLEMENT_CALCULATION',
      summary: `Bulk deleted ${result.deletedCount} settlement calculation records from database`,
    });

    return { deletedCount: result.deletedCount };
  }
}
