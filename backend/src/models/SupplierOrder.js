import mongoose from 'mongoose';
import { SUPPLIER_ORDER_STATUSES } from '../config/constants.js';

const supplierOrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    productName: {
      type: String,
      required: true,
    },
    quantityRequested: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      default: 'PCS',
    },
    estimatedUnitCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const supplierOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
      index: true,
    },
    supplierPhone: {
      type: String,
      default: '',
    },
    items: {
      type: [supplierOrderItemSchema],
      validate: {
        validator: (items) => items && items.length > 0,
        message: 'A supplier order must contain at least one product item.',
      },
    },
    status: {
      type: String,
      enum: Object.values(SUPPLIER_ORDER_STATUSES),
      default: SUPPLIER_ORDER_STATUSES.DRAFT,
      index: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    receivedDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const SupplierOrder =
  mongoose.models.SupplierOrder || mongoose.model('SupplierOrder', supplierOrderSchema);
