import { z } from 'zod';
import { JOB_STATUSES, JOB_TYPES } from '../config/constants.js';

const jobItemSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createJobCardSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name is required').optional(),
    mobileNumber: z.string().optional(),
    bikeName: z.string().min(1, 'Bike name is required').optional(),
    registrationNumber: z.string().optional().default(''),
    serviceDetails: z.string().optional().default(''),
    customerId: z.string().optional(),
    vehicleId: z.string().optional(),
    serviceType: z.nativeEnum(JOB_TYPES).optional().default(JOB_TYPES.FULL_SERVICE),
    items: z.array(jobItemSchema).optional().default([]),
    labourCharges: z.number().min(0).optional().default(0),
  }),
});

export const updateJobCardSchema = z.object({
  body: z.object({
    customerName: z.string().optional(),
    mobileNumber: z.string().optional(),
    bikeName: z.string().optional(),
    registrationNumber: z.string().optional(),
    serviceDetails: z.string().optional(),
    items: z.array(jobItemSchema).optional(),
    labourCharges: z.number().min(0).optional(),
  }),
});

export const updateJobCardStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(JOB_STATUSES, {
      errorMap: () => ({ message: 'Invalid service job status' }),
    }),
  }),
});
