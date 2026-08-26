import mongoose from 'mongoose';
import { PARTNERS, PARTNER_TRANSACTION_TYPES, MONEY_SOURCES } from '../config/constants.js';

const partnerTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    partner: {
      type: String,
      enum: Object.values(PARTNERS),
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PARTNER_TRANSACTION_TYPES),
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Transaction amount must be greater than zero'],
    },
    source: {
      type: String,
      enum: Object.values(MONEY_SOURCES),
      default: MONEY_SOURCES.GARAGE_MONEY,
    },
    reason: {
      type: String,
      required: [true, 'Reason or purpose is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export const PartnerTransaction =
  mongoose.models.PartnerTransaction ||
  mongoose.model('PartnerTransaction', partnerTransactionSchema);
