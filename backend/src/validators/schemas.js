import { z } from 'zod';
import { createProductSchema as prdSchema } from './inventory.validator.js';

export const createProductSchema = prdSchema;

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  mobileNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).refine(data => Boolean(data.mobileNumber || data.phone), {
  message: 'Valid mobile number is required',
  path: ['mobileNumber'],
});

export const createPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than zero'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
});

export const createExpenseSchema = z.object({
  title: z.string().min(2, 'Expense title is required'),
  amount: z.number().min(0.01, 'Expense amount must be greater than zero'),
  category: z.string().min(1, 'Category is required'),
});

export const createPartnerTransactionSchema = z.object({
  partner: z.string().min(1, 'Partner is required'),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  type: z.string().min(1, 'Type is required'),
});
