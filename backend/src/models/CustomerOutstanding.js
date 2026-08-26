import mongoose from 'mongoose';

const customerOutstandingSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    bikeName: {
      type: String,
      required: [true, 'Bike name is required'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    pendingAmount: {
      type: Number,
      required: [true, 'Pending amount is required'],
      min: [0, 'Pending amount cannot be negative'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

customerOutstandingSchema.index({ customerName: 'text', mobileNumber: 'text', bikeName: 'text' });

export const CustomerOutstanding =
  mongoose.models.CustomerOutstanding || mongoose.model('CustomerOutstanding', customerOutstandingSchema);
