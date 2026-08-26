import { z } from 'zod';
import { PAYMENT_METHODS } from '../config/constants.js';

export const createBillSchema = z.object({
  jobId: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  customerName: z.string().optional(),
  mobileNumber: z.string().optional(),
  bikeName: z.string().optional(),
  bikeNumber: z.string().optional(),
  grandTotal: z.number().optional(),
  paymentStatus: z.string().optional(),
  serviceType: z.string().optional(),
  serviceDetails: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        quantity: z.number().optional(),
      })
    )
    .optional(),
  labourCharges: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS), {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
});
