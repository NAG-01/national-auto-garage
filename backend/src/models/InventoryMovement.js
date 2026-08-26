import mongoose from 'mongoose';
import { INVENTORY_MOVEMENT_TYPES } from '../config/constants.js';

const inventoryMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    movementType: {
      type: String,
      enum: Object.values(INVENTORY_MOVEMENT_TYPES),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

inventoryMovementSchema.index({ productId: 1, createdAt: -1 });

export const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model('InventoryMovement', inventoryMovementSchema);
