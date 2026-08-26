import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES, MONEY_SOURCES } from '../config/constants.js';

const businessExpenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(EXPENSE_CATEGORIES),
      required: [true, 'Expense category is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Expense description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Expense amount must be greater than zero'],
    },
    paidBy: {
      type: String,
      enum: Object.values(MONEY_SOURCES),
      required: [true, 'Payer source (GARAGE_MONEY, NAIM_PERSONAL, IMRAN_PERSONAL) is required'],
      default: MONEY_SOURCES.GARAGE_MONEY,
      index: true,
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

export const BusinessExpense =
  mongoose.models.BusinessExpense ||
  mongoose.model('BusinessExpense', businessExpenseSchema);
