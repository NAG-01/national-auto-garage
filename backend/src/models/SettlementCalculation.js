import mongoose from 'mongoose';

const settlementCalculationSchema = new mongoose.Schema(
  {
    calculationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    garageExpenses: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    netProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    naimAdvance: {
      type: Number,
      default: 0,
      min: 0,
    },
    imranAdvance: {
      type: Number,
      default: 0,
      min: 0,
    },
    naimBaseShare: {
      type: Number,
      default: 0,
    },
    imranBaseShare: {
      type: Number,
      default: 0,
    },
    naimFinalPayout: {
      type: Number,
      default: 0,
    },
    imranFinalPayout: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export const SettlementCalculation = mongoose.model('SettlementCalculation', settlementCalculationSchema);
