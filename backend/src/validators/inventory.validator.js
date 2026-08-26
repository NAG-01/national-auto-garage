import { z } from 'zod';
import { INVENTORY_MOVEMENT_TYPES } from '../config/constants.js';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    category: z.string().min(1, 'Category is required'),
    purchaseCost: z.number().min(0, 'Purchase cost cannot be negative').optional().default(0),
    sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
    currentStock: z.number().min(0, 'Initial stock cannot be negative').default(0),
    minimumStockLevel: z.number().min(0, 'Minimum stock level cannot be negative').default(3),
    unit: z.string().optional().default('PCS'),
    notes: z.string().optional().default(''),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
    category: z.string().min(1, 'Category is required').optional(),
    purchaseCost: z.number().min(0, 'Purchase cost cannot be negative').optional(),
    sellingPrice: z.number().min(0, 'Selling price cannot be negative').optional(),
    minimumStockLevel: z.number().min(0, 'Minimum stock level cannot be negative').optional(),
    unit: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    adjustmentQuantity: z.number().int('Adjustment quantity must be a whole number'),
    movementType: z.enum([
      INVENTORY_MOVEMENT_TYPES.PURCHASE_RECEIVED,
      INVENTORY_MOVEMENT_TYPES.MANUAL_ADJUSTMENT,
      INVENTORY_MOVEMENT_TYPES.CORRECTION,
      INVENTORY_MOVEMENT_TYPES.RETURN,
      INVENTORY_MOVEMENT_TYPES.OPENING_STOCK,
    ]),
    reason: z.string().min(3, 'Reason for stock adjustment is required'),
    notes: z.string().optional(),
  }),
});

// Backward Compatibility Aliases for older routes
export const createPartSchema = createProductSchema;
export const updatePartSchema = updateProductSchema;

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Supplier name is required'),
    contactPerson: z.string().optional(),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierInvoiceNo: z.string().optional(),
    supplierId: z.string().min(1, 'Supplier is required'),
    purchaseDate: z.string().optional(),
    items: z
      .array(
        z.object({
          partId: z.string().min(1, 'Part ID required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
          unitCost: z.number().min(0, 'Unit cost cannot be negative'),
        })
      )
      .min(1, 'Purchase must have at least one item'),
    taxAmount: z.number().min(0).default(0),
    amountPaid: z.number().min(0).default(0),
    paymentMethod: z.string().default('CASH'),
    notes: z.string().optional(),
  }),
});
