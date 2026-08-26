import mongoose from 'mongoose';

const monthlySettlementSchema = new mongoose.Schema(
  {
    settlementNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    totalCashReceived: {
      type: Number,
      required: true,
      min: 0,
    },
    totalBilledRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    totalOutstandingReceivables: {
      type: Number,
      required: true,
      min: 0,
    },
    totalBusinessExpenses: {
      type: Number,
      required: true,
      min: 0,
    },
    netDistributableProfit: {
      type: Number,
      required: true,
    },
    naimShare: {
      type: Number,
      required: true,
    },
    imranShare: {
      type: Number,
      required: true,
    },
    naimWithdrawals: {
      type: Number,
      default: 0,
      min: 0,
    },
    imranWithdrawals: {
      type: Number,
      default: 0,
      min: 0,
    },
    naimOutOfPocketCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    imranOutOfPocketCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    naimFinalPayout: {
      type: Number,
      required: true,
    },
    imranFinalPayout: {
      type: Number,
      required: true,
    },
    isFinalized: {
      type: Boolean,
      default: false,
      index: true,
    },
    finalizedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

monthlySettlementSchema.index({ year: 1, month: 1 }, { unique: true });

export const MonthlySettlement =
  mongoose.models.MonthlySettlement ||
  mongoose.model('MonthlySettlement', monthlySettlementSchema);
