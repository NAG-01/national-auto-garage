import { z } from 'zod';
import { validatePhone } from '../utils/currency.js';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name is too long'),
    mobileNumber: z
      .string()
      .refine((val) => validatePhone(val), {
        message: 'Mobile number must be a valid 10-digit Indian mobile number',
      }),
    address: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters').max(100).optional(),
    mobileNumber: z
      .string()
      .refine((val) => validatePhone(val), {
        message: 'Mobile number must be a valid 10-digit Indian mobile number',
      })
      .optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
