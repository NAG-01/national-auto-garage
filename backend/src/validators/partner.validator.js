import { z } from 'zod';
import { PARTNERS, PARTNER_TRANSACTION_TYPES, MONEY_SOURCES } from '../config/constants.js';

export const recordTransactionSchema = z.object({
  partner: z.nativeEnum(PARTNERS, {
    errorMap: () => ({ message: 'Partner must be NAIM or IMRAN' }),
  }),
  type: z.nativeEnum(PARTNER_TRANSACTION_TYPES, {
    errorMap: () => ({ message: 'Invalid transaction type' }),
  }),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .gt(0, 'Amount must be greater than zero'),
  source: z.nativeEnum(MONEY_SOURCES).optional(),
  reason: z.string().min(2, 'Reason must be at least 2 characters'),
  date: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export const settlementQuerySchema = z.object({
  month: z.string().or(z.number()).optional(),
  year: z.string().or(z.number()).optional(),
});

export const finalizeSettlementSchema = z.object({
  month: z.number({ required_error: 'Month is required' }).min(1).max(12),
  year: z.number({ required_error: 'Year is required' }).min(2020),
  notes: z.string().optional(),
});
