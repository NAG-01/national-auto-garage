import { z } from 'zod';
import { SUPPLIER_ORDER_STATUSES } from '../config/constants.js';

const orderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, 'Item name is required'),
  quantityRequested: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
  unit: z.string().optional().default('PCS'),
  estimatedUnitCost: z.number().min(0, 'Unit cost cannot be negative').optional().default(0),
});

export const createSupplierOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().min(1, 'Supplier is required'),
    supplierPhone: z.string().optional().default(''),
    items: z.array(orderItemSchema).min(1, 'At least one product item is required'),
    orderDate: z.string().optional(),
    notes: z.string().optional().default(''),
  }),
});

export const updateSupplierOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().optional(),
    supplierPhone: z.string().optional(),
    items: z.array(orderItemSchema).min(1).optional(),
    orderDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});
