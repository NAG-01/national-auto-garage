import { z } from 'zod';

export const createExpenseSchema = z.object({
  category: z.string().optional().default('MISCELLANEOUS'),
  amount: z.coerce.number().positive('Expense amount must be greater than zero'),
  description: z.string().optional().or(z.literal('')).transform(val => (val && val.trim() ? val.trim() : 'Expense Entry')),
  paidBy: z.string().optional().default('GARAGE_ACCOUNT'),
  partnerId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().default('CASH'),
  date: z.union([z.string(), z.date()]).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});
