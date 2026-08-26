import mongoose from 'mongoose';

const partSchema = new mongoose.Schema(
  {
    partNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    compatibleModels: [
      {
        type: String,
        trim: true,
      },
    ],
    unit: {
      type: String,
      default: 'PCS',
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    maxStockLevel: {
      type: Number,
      default: 100,
    },
    primarySupplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    alternateSupplierIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
      },
    ],
    rackLocation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

partSchema.index({ partNumber: 'text', name: 'text', brand: 'text', category: 'text' });

export const Part = mongoose.model('Part', partSchema);
