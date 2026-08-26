import mongoose from 'mongoose';
import { PAYMENT_STATUSES } from '../config/constants.js';

const billItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceJob',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: false,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false,
    },
    customerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      index: true,
    },
    bikeName: {
      type: String,
      required: true,
    },
    bikeNumber: {
      type: String,
      default: '',
    },
    serviceType: {
      type: String,
      required: true,
    },
    serviceDetails: {
      type: String,
      default: '',
    },
    items: {
      type: [billItemSchema],
      default: [],
    },
    partsSubtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    labourCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES),
      default: PAYMENT_STATUSES.UNPAID,
      index: true,
    },
    billDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

billSchema.index({ customerId: 1, paymentStatus: 1 });
billSchema.index({ mobileNumber: 1, paymentStatus: 1 });
billSchema.index({ jobId: 1 }, { sparse: true });
billSchema.index({ customerName: 'text', mobileNumber: 'text', bikeName: 'text', billNumber: 'text' });

export const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
