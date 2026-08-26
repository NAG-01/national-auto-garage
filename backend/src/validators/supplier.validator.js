import { z } from 'zod';
import { validatePhone } from '../utils/currency.js';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Supplier name must be at least 2 characters').max(100, 'Supplier name is too long'),
    phone: z
      .string()
      .refine((val) => validatePhone(val), {
        message: 'Mobile number must be a valid 10-digit Indian phone number',
      }),
    address: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Supplier name must be at least 2 characters').max(100).optional(),
    phone: z
      .string()
      .refine((val) => validatePhone(val), {
        message: 'Mobile number must be a valid 10-digit Indian phone number',
      })
      .optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
