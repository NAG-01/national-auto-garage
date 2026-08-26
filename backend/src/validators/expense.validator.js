import { z } from 'zod';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../config/constants.js';

export const createExpenseSchema = z.object({
  category: z.enum([
    'RENT',
    'ELECTRICITY',
    'SALARY',
    'TOOLS_EQUIPMENT',
    'SUPPLIES',
    'TRANSPORT',
    'TEA_SNACKS',
    'MAINTENANCE',
    'MISCELLANEOUS',
    ...(Array.isArray(EXPENSE_CATEGORIES) ? EXPENSE_CATEGORIES : []),
  ]).or(z.string().min(1, 'Category is required')),
  amount: z.number().positive('Expense amount must be greater than zero'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  paidBy: z.string().default('GARAGE_ACCOUNT'),
  partnerId: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'OTHER']).default('CASH'),
  date: z.string().or(z.date()).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});
