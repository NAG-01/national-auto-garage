import mongoose from 'mongoose';
import { JOB_TYPES, JOB_STATUSES } from '../config/constants.js';

const serviceItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productNameSnapshot: {
      type: String,
      required: true,
    },
    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const serviceJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: Object.values(JOB_TYPES),
      default: JOB_TYPES.FULL_SERVICE,
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    customerNameSnapshot: {
      type: String,
      default: '',
    },
    mobileNumberSnapshot: {
      type: String,
      default: '',
    },
    bikeNameSnapshot: {
      type: String,
      default: '',
    },
    registrationNumberSnapshot: {
      type: String,
      default: '',
    },
    serviceDetails: {
      type: String,
      required: [true, 'Service problem / details description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUSES),
      default: JOB_STATUSES.PENDING,
      index: true,
    },
    items: {
      type: [serviceItemSchema],
      default: [],
    },
    partsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    labourCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    isStockDeducted: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const ServiceJob =
  mongoose.models.ServiceJob || mongoose.model('ServiceJob', serviceJobSchema);
