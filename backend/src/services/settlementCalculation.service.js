import { roundMoney } from '../utils/currency.js';

export class SettlementCalculationService {
  static async saveCalculation(data) {
    const totalRevenue = roundMoney(data.totalRevenue || 0);
    const garageExpenses = roundMoney(data.garageExpenses || 0);
    const naimAdvance = roundMoney(data.naimAdvance || 0);
    const imranAdvance = roundMoney(data.imranAdvance || 0);

    const netProfit = roundMoney(totalRevenue - garageExpenses);
    const naimBaseShare = roundMoney(netProfit * 0.5);
    const imranBaseShare = roundMoney(netProfit * 0.5);

    const naimFinalPayout = roundMoney(naimBaseShare - naimAdvance);
    const imranFinalPayout = roundMoney(imranBaseShare - imranAdvance);

    return {
      _id: `calc_${Date.now()}`,
      calculationNumber: `CALC-${Date.now().toString().slice(-4)}`,
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
    };
  }

  static async getCalculations() {
    return {
      records: [],
      pagination: { page: 1, limit: 20, totalRecords: 0, totalPages: 0 },
    };
  }

  static async deleteCalculation() {
    return { success: true };
  }

  static async bulkDeleteCalculations() {
    return { deletedCount: 0 };
  }
}
