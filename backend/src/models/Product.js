import mongoose from 'mongoose';
import { STOCK_STATUSES } from '../config/constants.js';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    purchaseCost: {
      type: Number,
      default: 0,
      min: [0, 'Purchase cost cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
      index: true,
    },
    minimumStockLevel: {
      type: Number,
      required: true,
      default: 3,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    unit: {
      type: String,
      default: 'PCS',
      trim: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('stockStatus').get(function () {
  if (this.currentStock === 0) return STOCK_STATUSES.OUT_OF_STOCK;
  if (this.currentStock <= this.minimumStockLevel) return STOCK_STATUSES.LOW_STOCK;
  return STOCK_STATUSES.IN_STOCK;
});

productSchema.index({ name: 'text', category: 'text' });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
