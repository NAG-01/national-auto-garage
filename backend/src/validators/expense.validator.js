import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

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
  description: z.string().optional().or(z.literal('')).transform(val => (val && val.trim() ? val.trim() : 'Expense Entry')),
  paidBy: z.string().default('GARAGE_ACCOUNT'),
  partnerId: z.string().optional().nullable(),
  paymentMethod: z.string().default('CASH'),
  date: z.string().or(z.date()).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});
